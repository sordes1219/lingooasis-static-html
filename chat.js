(function () {
  const welcomeEl = document.getElementById("welcome");
  const chatEl = document.getElementById("chat");
  const startButtonEl = document.getElementById("start");
  const langSelectEl = document.getElementById("lang-select");
  const statusEl = document.getElementById("status");
  const messagesEl = document.getElementById("messages");
  const messageInnerEl = document.getElementById("message-inner");
  const inputEl = document.getElementById("input");
  const formEl = document.getElementById("form");
  const reconnectButtonEl = document.getElementById("reconnect");
  const sendButtonEl = document.getElementById("send");

  let dataChannel;
  let currentPeerConnection = null;
  let currentSupabaseClient = null;
  let currentChannel = null;
  const SUPPORTED_LANGUAGE_CODES = [
    "zh",
    "es",
    "en",
    "hi",
    "pt",
    "ru",
    "ja",
    "fr",
    "de",
    "ko",
    "vi",
    "it",
    "th",
  ];

  // ゲストが「reconnect」ボタンを押して再接続する場合、以前のPeerConnectionや
  // Supabaseのシグナリング購読を片付けずに新しい接続を作ると、古い購読が同じ
  // roomCodeチャンネル上のsdp-answer/ice-candidateを引き続き受信してしまい、
  // 新しいPeerConnectionのネゴシエーションを妨害する（結果としてゲスト側だけ
  // データチャンネルが開かず送信できなくなる）。そのため、新しい接続を作る前に
  // 必ず古い接続を破棄する。
  function cleanupConnection() {
    // 注: peerConnection.close()を呼ぶと、それに紐づくdataChannelの
    // onclose イベントも発火してしまう。reconnectボタンによる意図的な
    // 再接続の場合にこれが起きると、古いdataChannel.onclose
    // （ホスト切断時用）が誤って発火し、"remote-disconnected"状態
    // （QRコード再読み込みを促す表示）に上書きされてしまうため、
    // close()より先にdataChannel側のハンドラも必ずnullにしておく。
    if (dataChannel) {
      dataChannel.onopen = null;
      dataChannel.onclose = null;
      dataChannel.onmessage = null;
    }
    if (currentPeerConnection) {
      currentPeerConnection.onicecandidate = null;
      currentPeerConnection.ondatachannel = null;
      currentPeerConnection.onconnectionstatechange = null;
      currentPeerConnection.close();
      currentPeerConnection = null;
    }
    if (currentSupabaseClient && currentChannel) {
      currentSupabaseClient.removeChannel(currentChannel);
    }
    currentSupabaseClient = null;
    currentChannel = null;
    dataChannel = null;
  }

  let params = new URLSearchParams(window.location.search);
  let roomCode = params.get("room");

  function detectInitialLanguage() {
    const browserLangs =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language];
    for (const raw of browserLangs) {
      const code = (raw || "").slice(0, 2).toLowerCase();
      if (SUPPORTED_LANGUAGE_CODES.includes(code)) return code;
    }
    return "en";
  }

  langSelectEl.value = detectInitialLanguage();

  function currentGuestLanguage() {
    return langSelectEl.value || "en";
  }

  function updateKeyboardInset() {
    if (!window.visualViewport) return;
    const shouldStickToBottom = isNearBottom();
    const inset = Math.max(
      0,
      window.innerHeight - window.visualViewport.height,
    );
    document.documentElement.style.setProperty(
      "--keyboard-bottom-inset",
      inset + "px",
    );
    updateLayoutHeights();
    if (shouldStickToBottom) scrollMessagesToBottom();
  }

  function updateLayoutHeights() {
    const viewportHeight = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;
    document.documentElement.style.setProperty(
      "--viewport-height",
      viewportHeight + "px",
    );
    document.documentElement.style.setProperty(
      "--form-height",
      formEl.offsetHeight + "px",
    );
  }

  function isNearBottom() {
    return (
      messagesEl.scrollTop + messagesEl.clientHeight >=
      messagesEl.scrollHeight - 24
    );
  }

  function scrollMessagesToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setConnectionState(state, text, color) {
    const canSend = state === "connected";
    statusEl.textContent = text;
    statusEl.style.color = color;
    inputEl.disabled = !canSend;
    sendButtonEl.disabled = !canSend;
    reconnectButtonEl.hidden = state !== "disconnected";
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateKeyboardInset);
  }
  window.addEventListener("resize", updateLayoutHeights);
  inputEl.addEventListener("focus", updateKeyboardInset);
  inputEl.addEventListener("blur", updateKeyboardInset);
  updateLayoutHeights();
  updateKeyboardInset();

  function appendMessage(text, type, subText) {
    const el = document.createElement("div");
    el.className = "bubble " + type;
    const main = document.createElement("div");
    main.className = "bubble-main";
    main.textContent = text;
    el.appendChild(main);
    if (subText) {
      const sub = document.createElement("div");
      sub.className = "bubble-sub";
      sub.textContent = subText;
      el.appendChild(sub);
    }
    messageInnerEl.appendChild(el);
    scrollMessagesToBottom();
  }

  function startChat() {
    langSelectEl.disabled = true;
    welcomeEl.hidden = true;
    chatEl.hidden = false;
    updateLayoutHeights();
    updateKeyboardInset();
    connectWebRtc();
  }

  function connectWebRtc() {
    // 前回の接続が残っている場合は必ず破棄してから新しい接続を作る
    cleanupConnection();

    // WebRTC connection logic will go here
    // Supabase client configuration
    const SUPABASE_URL = "https://kicccaxfxgkpdsmgxdox.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpY2NjYXhmeGdrcGRzbWd4ZG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDI2NTUsImV4cCI6MjEwNDAxODY1NX0.5s5bXuPpZPMTy1qc4DaYuwWy_EiwzIcTbFLcIMgA6Gk";
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    currentSupabaseClient = supabaseClient;

    // WebRTC PeerConnection の作成
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    currentPeerConnection = peerConnection;
    console.log("✅ WebRTCオブジェクトを作成しました");

    // データチャンネルが確立したときの共通処理
    function setupDataChannel(channel) {
      dataChannel = channel;
      dataChannel.onopen = () => {
        console.log(
          "🎉 P2P Data Channel が確立（開通）しました！ Channel: " +
            channel.label,
        );
        setConnectionState("connected", "📡 Connected to the host!");
        // データチャンネル開通直後の最初の送信は、ホスト側の受信準備が
        // 間に合わず取りこぼされることが稀にあるため、少し間を置いて
        // 保険としてもう一度送信する
        const sendGuestLang = () => {
          if (channel.readyState !== "open") return;
          channel.send(
            JSON.stringify({
              type: "guest-lang",
              lang: currentGuestLanguage(),
            }),
          );
        };
        sendGuestLang();
        setTimeout(sendGuestLang, 1000);
      };
      dataChannel.onclose = () => {
        console.log("🔌 データチャンネルが切断されました");
        setConnectionState(
          "remote-disconnected",
          "❌ Disconnected from the host. Please read qr-code again.",
        );
        cleanupConnection();
      };
      dataChannel.onmessage = (event) => {
        console.log("📩 受信データ: " + event.data);
        const data = JSON.parse(event.data);
        appendMessage(data.text, "received", data.original);
      };
    }

    // デフォルトのデータチャネルを作成
    const defaultChannel = peerConnection.createDataChannel("chat");
    setupDataChannel(defaultChannel);

    // 相手が作ったデータチャンネルを受け取る場合
    peerConnection.ondatachannel = (event) => {
      console.log("🛰️ 相手からデータチャンネルを受け取りました");
      setupDataChannel(event.channel);
    };

    // Supabaseのシグナリング部屋
    const channel = supabaseClient.channel(roomCode);
    currentChannel = channel;
    console.log("📡 シグナリング部屋に接続しました: " + roomCode);

    // Supabaseのシグナリングイベントを処理するリスナーを設定
    // 注: ゲストは常にOffer側（Offerer）であり、Answerを送ることはないため、
    // 自分自身が送信した"sdp-offer"を受信し得るハンドラは不要かつ危険（自己エコーにより
    // 誤った状態でsetRemoteDescriptionを呼んでしまう原因になる）。
    // そのため"sdp-offer"の購読は意図的に行わない。
    channel
      .on("broadcast", { event: "sdp-answer" }, async ({ payload }) => {
        console.log("📩 SDP Answer（承認）を受信しました");
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(payload.sdp),
        );
      })
      .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
        if (payload.candidate) {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(payload.candidate),
          );
        }
      })
      .subscribe((status) => {
        // 注: これはSupabase Realtime（シグナリング用WebSocket）自体の接続状態であり、
        // ホストとのWebRTC P2P接続の状態ではない。そのため"connected"扱いにはせず、
        // 失敗・タイムアウト時のみUIに反映する。P2P接続状態はpeerConnectionの
        // connectionstatechangeで監視する。
        if (status === "SUBSCRIBED") {
          console.log("📡 シグナリング準備完了");
          // 注: channel.send()はWebSocketの購読（SUBSCRIBED）が完了する前に
          // 呼び出すと、Supabase RealtimeがREST API経由の送信に自動フォール
          // バックしてしまう（"Realtime send() is automatically falling back
          // to REST API"という警告が出る）。RESTフォールバックは遅延や失敗の
          // 原因になり得るため、Offerの送信はSUBSCRIBED確定後にのみ行う。
          offerRequest();
        } else if (status === "ERROR" || status === "CHANNEL_ERROR") {
          setConnectionState(
            "disconnected",
            "⚠️ Failed to connect to the host! Please reconnect.",
          );
          console.log("⚠️ シグナリング部屋への接続に失敗しました");
        } else if (status === "TIMED_OUT") {
          setConnectionState(
            "disconnected",
            "⚠️ Connection to the host timed out. Please reconnect.",
          );
          console.log("⚠️ シグナリング部屋への接続がタイムアウトしました");
        }
      });

    // 自分のネットワーク経路（ICE）が見つかったら相手に転送
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        channel.send({
          type: "broadcast",
          event: "ice-candidate",
          payload: { candidate: event.candidate },
        });
      }
    };

    // WebRTC P2P接続自体の状態変化を監視する。
    // ホストがアプリを閉じる／ネットワークを切るなどした場合、Supabaseの
    // シグナリング購読状態は変化しないため、ここでホスト切断を検知する。
    peerConnection.onconnectionstatechange = () => {
      console.log(
        "🔄 PeerConnectionの状態が変化しました: " +
          peerConnection.connectionState,
      );
      if (
        peerConnection.connectionState === "disconnected" ||
        peerConnection.connectionState === "failed" ||
        peerConnection.connectionState === "closed"
      ) {
        setConnectionState(
          "disconnected",
          "⚠️ Disconnected from the host. Please reconnect.",
        );
      }
    };

    // Offer（接続要求）を作成して送信
    const offerRequest = async () => {
      console.log("🚀 Offer（接続要求）を作成中...");
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      console.log("📤 SDP Offerを送信しました。相手の反応を待っています...");
      channel.send({
        type: "broadcast",
        event: "sdp-offer",
        payload: { sdp: offer },
      });
    };
  }

  startButtonEl.addEventListener("click", startChat);
  reconnectButtonEl.addEventListener("click", connectWebRtc);

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (dataChannel && dataChannel.readyState === "open") {
      dataChannel.send(
        JSON.stringify({
          type: "chat",
          direction: "guest-to-host",
          text: text,
          original: text,
          timestamp: Date.now(),
        }),
      );
      console.log("📤 送信メッセージ: " + text);
      inputEl.value = "";
    } else {
      console.log(
        "⚠️ データチャンネルが開いていません。メッセージを送信できません。",
      );
      return;
    }
    appendMessage(text, "sent");
    inputEl.value = "";
  });
})();
