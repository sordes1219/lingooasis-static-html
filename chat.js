(function () {
  const welcomeEl = document.getElementById("welcome");
  const chatEl = document.getElementById("chat");
  const startButtonEl = document.getElementById("start");
  const statusEl = document.getElementById("status");
  const messagesEl = document.getElementById("messages");
  const messageInnerEl = document.getElementById("message-inner");
  const inputEl = document.getElementById("input");
  const formEl = document.getElementById("form");
  const reconnectButtonEl = document.getElementById("reconnect");
  const sendButtonEl = document.getElementById("send");

  let dataChannel;

  let params = new URLSearchParams(window.location.search);
  let roomCode = params.get("room");

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
    welcomeEl.hidden = true;
    chatEl.hidden = false;
    updateLayoutHeights();
    updateKeyboardInset();
    // connectWebSocket();
    // connectWebRtc();
  }

  function connectWebRtc() {
    // WebRTC connection logic will go here
    // Supabase client configuration
    const SUPABASE_URL = "https://kicccaxfxgkpdsmgxdox.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpY2NjYXhmeGdrcGRzbWd4ZG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDI2NTUsImV4cCI6MjEwNDAxODY1NX0.5s5bXuPpZPMTy1qc4DaYuwWy_EiwzIcTbFLcIMgA6Gk";
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // WebRTC PeerConnection の作成
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    console.log("✅ WebRTCオブジェクトを作成しました");

    // データチャンネルが確立したときの共通処理
    function setupDataChannel(channel) {
      dataChannel = channel;
      dataChannel.onopen = () => {
        console.log(
          "🎉 P2P Data Channel が確立（開通）しました！ Channel: " +
            channel.label,
        );
        document.getElementById("input").disabled = false;
        document.getElementById("send").disabled = false;
      };
      dataChannel.onmessage = (event) => {
        console.log("📩 受信データ: " + event.data);
        appendMessage(event.data, "received");
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
        if (status === "SUBSCRIBED") {
          document.getElementById("status").innerText =
            "📡 Supabaseシグナリング部屋に入室完了！";
          console.log("📡 シグナリング準備完了");
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

    offerRequest();
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
