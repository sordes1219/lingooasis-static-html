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
  const welcomeCopyEl = document.getElementById("welcome-copy");
  const safetyItem1El = document.getElementById("safety-item-1");
  const safetyItem2El = document.getElementById("safety-item-2");
  const safetyItem3El = document.getElementById("safety-item-3");
  const langLabelEl = document.getElementById("lang-label");
  let currentConnectionState = "connecting";
  let currentStatusMessageKey = "statusConnecting";

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

  const GUEST_UI_STRINGS = {
    zh: {
      welcomeCopy: "用你自己的语言面对面交流。",
      safetyItem1: "无需下载App",
      safetyItem2: "无需注册",
      safetyItem3: "100%安全私密",
      yourLanguageLabel: "您的语言",
      startButton: "开始聊天",
      inputPlaceholder: "输入消息...",
      reconnectButton: "重新连接",
      statusConnecting: "连接中...",
      statusConnected: "📡 已连接到主机！",
      statusRemoteDisconnected: "❌ 与主机的连接已断开，请重新扫描二维码。",
      statusSignalingFailed: "⚠️ 连接主机失败！请重新连接。",
      statusSignalingTimeout: "⚠️ 连接主机超时。请重新连接。",
      statusPeerDisconnected: "⚠️ 与主机的连接已断开。请重新连接。",
    },
    es: {
      welcomeCopy: "Habla cara a cara en tu propio idioma.",
      safetyItem1: "No requiere app",
      safetyItem2: "No requiere registro",
      safetyItem3: "100% seguro y privado",
      yourLanguageLabel: "Tu idioma",
      startButton: "Iniciar chat",
      inputPlaceholder: "Escribe un mensaje...",
      reconnectButton: "Reconectar",
      statusConnecting: "Conectando...",
      statusConnected: "📡 ¡Conectado con el anfitrión!",
      statusRemoteDisconnected: "❌ Desconectado del anfitrión. Vuelve a leer el código QR.",
      statusSignalingFailed: "⚠️ ¡No se pudo conectar con el anfitrión! Vuelve a conectar.",
      statusSignalingTimeout: "⚠️ La conexión con el anfitrión ha caducado. Vuelve a conectar.",
      statusPeerDisconnected: "⚠️ Desconectado del anfitrión. Vuelve a conectar.",
    },
    en: {
      welcomeCopy: "Talk face-to-face in your own language.",
      safetyItem1: "No App Required",
      safetyItem2: "No Registration Needed",
      safetyItem3: "100% Safe & Private",
      yourLanguageLabel: "Your language",
      startButton: "Start Chat",
      inputPlaceholder: "Type a message...",
      reconnectButton: "Reconnect",
      statusConnecting: "Connecting...",
      statusConnected: "📡 Connected to the host!",
      statusRemoteDisconnected: "❌ Disconnected from the host. Please read qr-code again.",
      statusSignalingFailed: "⚠️ Failed to connect to the host! Please reconnect.",
      statusSignalingTimeout: "⚠️ Connection to the host timed out. Please reconnect.",
      statusPeerDisconnected: "⚠️ Disconnected from the host. Please reconnect.",
    },
    hi: {
      welcomeCopy: "अपनी ही भाषा में आमने-सामने बात करें।",
      safetyItem1: "कोई ऐप आवश्यक नहीं",
      safetyItem2: "पंजीकरण की आवश्यकता नहीं",
      safetyItem3: "100% सुरक्षित और निजी",
      yourLanguageLabel: "आपकी भाषा",
      startButton: "चैट शुरू करें",
      inputPlaceholder: "संदेश लिखें...",
      reconnectButton: "पुनः कनेक्ट करें",
      statusConnecting: "कनेक्ट हो रहा है...",
      statusConnected: "📡 होस्ट से जुड़ गए!",
      statusRemoteDisconnected: "❌ होस्ट से कनेक्शन टूट गया। कृपया फिर से QR कोड स्कैन करें।",
      statusSignalingFailed: "⚠️ होस्ट से कनेक्ट नहीं हो सका! कृपया फिर से कनेक्ट करें।",
      statusSignalingTimeout: "⚠️ होस्ट से कनेक्शन का समय समाप्त हो गया। कृपया फिर से कनेक्ट करें।",
      statusPeerDisconnected: "⚠️ होस्ट से कनेक्शन टूट गया। कृपया फिर से कनेक्ट करें।",
    },
    pt: {
      welcomeCopy: "Converse cara a cara no seu próprio idioma.",
      safetyItem1: "Sem necessidade de app",
      safetyItem2: "Sem necessidade de cadastro",
      safetyItem3: "100% seguro e privado",
      yourLanguageLabel: "Seu idioma",
      startButton: "Iniciar chat",
      inputPlaceholder: "Digite uma mensagem...",
      reconnectButton: "Reconectar",
      statusConnecting: "Conectando...",
      statusConnected: "📡 Conectado ao anfitrião!",
      statusRemoteDisconnected: "❌ Desconectado do anfitrião. Leia o código QR novamente.",
      statusSignalingFailed: "⚠️ Falha ao conectar ao anfitrião! Reconecte-se.",
      statusSignalingTimeout: "⚠️ A conexão com o anfitrião expirou. Reconecte-se.",
      statusPeerDisconnected: "⚠️ Desconectado do anfitrião. Reconecte-se.",
    },
    ru: {
      welcomeCopy: "Общайтесь лицом к лицу на своём родном языке.",
      safetyItem1: "Приложение не требуется",
      safetyItem2: "Регистрация не требуется",
      safetyItem3: "100% безопасно и приватно",
      yourLanguageLabel: "Ваш язык",
      startButton: "Начать чат",
      inputPlaceholder: "Введите сообщение...",
      reconnectButton: "Переподключиться",
      statusConnecting: "Подключение...",
      statusConnected: "📡 Подключено к хосту!",
      statusRemoteDisconnected: "❌ Соединение с хостом разорвано. Отсканируйте QR-код ещё раз.",
      statusSignalingFailed: "⚠️ Не удалось подключиться к хосту! Переподключитесь.",
      statusSignalingTimeout: "⚠️ Время ожидания подключения к хосту истекло. Переподключитесь.",
      statusPeerDisconnected: "⚠️ Соединение с хостом разорвано. Переподключитесь.",
    },
    ja: {
      welcomeCopy: "自分の言語のまま、面と向かって話せます。",
      safetyItem1: "アプリ不要",
      safetyItem2: "登録不要",
      safetyItem3: "100%安全・プライベート",
      yourLanguageLabel: "あなたの言語",
      startButton: "チャットを始める",
      inputPlaceholder: "メッセージを入力...",
      reconnectButton: "再接続",
      statusConnecting: "接続中...",
      statusConnected: "📡 ホストと接続しました！",
      statusRemoteDisconnected: "❌ ホストとの接続が切れました。もう一度QRコードを読み取ってください。",
      statusSignalingFailed: "⚠️ ホストへの接続に失敗しました！再接続してください。",
      statusSignalingTimeout: "⚠️ ホストへの接続がタイムアウトしました。再接続してください。",
      statusPeerDisconnected: "⚠️ ホストとの接続が切れました。再接続してください。",
    },
    fr: {
      welcomeCopy: "Parlez face à face dans votre propre langue.",
      safetyItem1: "Aucune application requise",
      safetyItem2: "Aucune inscription requise",
      safetyItem3: "100% sûr et privé",
      yourLanguageLabel: "Votre langue",
      startButton: "Démarrer le chat",
      inputPlaceholder: "Écrivez un message...",
      reconnectButton: "Se reconnecter",
      statusConnecting: "Connexion...",
      statusConnected: "📡 Connecté à l'hôte !",
      statusRemoteDisconnected: "❌ Déconnecté de l'hôte. Veuillez rescanner le code QR.",
      statusSignalingFailed: "⚠️ Échec de la connexion à l'hôte ! Veuillez vous reconnecter.",
      statusSignalingTimeout: "⚠️ Le délai de connexion à l'hôte a expiré. Veuillez vous reconnecter.",
      statusPeerDisconnected: "⚠️ Déconnecté de l'hôte. Veuillez vous reconnecter.",
    },
    de: {
      welcomeCopy: "Sprechen Sie von Angesicht zu Angesicht in Ihrer eigenen Sprache.",
      safetyItem1: "Keine App erforderlich",
      safetyItem2: "Keine Registrierung erforderlich",
      safetyItem3: "100% sicher & privat",
      yourLanguageLabel: "Ihre Sprache",
      startButton: "Chat starten",
      inputPlaceholder: "Nachricht eingeben...",
      reconnectButton: "Erneut verbinden",
      statusConnecting: "Verbindung wird hergestellt...",
      statusConnected: "📡 Mit dem Host verbunden!",
      statusRemoteDisconnected: "❌ Verbindung zum Host getrennt. Bitte scannen Sie den QR-Code erneut.",
      statusSignalingFailed: "⚠️ Verbindung zum Host fehlgeschlagen! Bitte erneut verbinden.",
      statusSignalingTimeout: "⚠️ Zeitüberschreitung bei der Verbindung zum Host. Bitte erneut verbinden.",
      statusPeerDisconnected: "⚠️ Verbindung zum Host getrennt. Bitte erneut verbinden.",
    },
    ko: {
      welcomeCopy: "자신의 언어 그대로 얼굴을 마주 보고 대화하세요.",
      safetyItem1: "앱 설치 불필요",
      safetyItem2: "등록 불필요",
      safetyItem3: "100% 안전하고 사적임",
      yourLanguageLabel: "내 언어",
      startButton: "채팅 시작",
      inputPlaceholder: "메시지를 입력하세요...",
      reconnectButton: "다시 연결",
      statusConnecting: "연결 중...",
      statusConnected: "📡 호스트와 연결되었습니다!",
      statusRemoteDisconnected: "❌ 호스트와의 연결이 끊어졌습니다. QR 코드를 다시 스캔해주세요.",
      statusSignalingFailed: "⚠️ 호스트에 연결하지 못했습니다! 다시 연결해주세요.",
      statusSignalingTimeout: "⚠️ 호스트 연결 시간이 초과되었습니다. 다시 연결해주세요.",
      statusPeerDisconnected: "⚠️ 호스트와의 연결이 끊어졌습니다. 다시 연결해주세요.",
    },
    vi: {
      welcomeCopy: "Trò chuyện trực tiếp bằng chính ngôn ngữ của bạn.",
      safetyItem1: "Không cần cài ứng dụng",
      safetyItem2: "Không cần đăng ký",
      safetyItem3: "100% an toàn & riêng tư",
      yourLanguageLabel: "Ngôn ngữ của bạn",
      startButton: "Bắt đầu trò chuyện",
      inputPlaceholder: "Nhập tin nhắn...",
      reconnectButton: "Kết nối lại",
      statusConnecting: "Đang kết nối...",
      statusConnected: "📡 Đã kết nối với máy chủ!",
      statusRemoteDisconnected: "❌ Đã ngắt kết nối với máy chủ. Vui lòng quét lại mã QR.",
      statusSignalingFailed: "⚠️ Kết nối với máy chủ thất bại! Vui lòng kết nối lại.",
      statusSignalingTimeout: "⚠️ Kết nối với máy chủ đã hết thời gian chờ. Vui lòng kết nối lại.",
      statusPeerDisconnected: "⚠️ Đã ngắt kết nối với máy chủ. Vui lòng kết nối lại.",
    },
    it: {
      welcomeCopy: "Parla faccia a faccia nella tua lingua.",
      safetyItem1: "Nessuna app richiesta",
      safetyItem2: "Nessuna registrazione richiesta",
      safetyItem3: "100% sicuro e privato",
      yourLanguageLabel: "La tua lingua",
      startButton: "Inizia chat",
      inputPlaceholder: "Scrivi un messaggio...",
      reconnectButton: "Riconnetti",
      statusConnecting: "Connessione in corso...",
      statusConnected: "📡 Connesso all'host!",
      statusRemoteDisconnected: "❌ Disconnesso dall'host. Scansiona di nuovo il codice QR.",
      statusSignalingFailed: "⚠️ Connessione all'host non riuscita! Riconnettiti.",
      statusSignalingTimeout: "⚠️ Connessione all'host scaduta. Riconnettiti.",
      statusPeerDisconnected: "⚠️ Disconnesso dall'host. Riconnettiti.",
    },
    th: {
      welcomeCopy: "พูดคุยแบบเห็นหน้ากันด้วยภาษาของคุณเอง",
      safetyItem1: "ไม่ต้องติดตั้งแอป",
      safetyItem2: "ไม่ต้องลงทะเบียน",
      safetyItem3: "ปลอดภัยและเป็นส่วนตัว 100%",
      yourLanguageLabel: "ภาษาของคุณ",
      startButton: "เริ่มแชท",
      inputPlaceholder: "พิมพ์ข้อความ...",
      reconnectButton: "เชื่อมต่อใหม่",
      statusConnecting: "กำลังเชื่อมต่อ...",
      statusConnected: "📡 เชื่อมต่อกับโฮสต์แล้ว!",
      statusRemoteDisconnected: "❌ การเชื่อมต่อกับโฮสต์ถูกตัด กรุณาสแกน QR โค้ดอีกครั้ง",
      statusSignalingFailed: "⚠️ เชื่อมต่อกับโฮสต์ไม่สำเร็จ! กรุณาเชื่อมต่อใหม่",
      statusSignalingTimeout: "⚠️ การเชื่อมต่อกับโฮสต์หมดเวลา กรุณาเชื่อมต่อใหม่",
      statusPeerDisconnected: "⚠️ การเชื่อมต่อกับโฮสต์ถูกตัด กรุณาเชื่อมต่อใหม่",
    },
  };

  const STATUS_COLORS = {
    connecting: "#64748b",
    connected: "#10b981",
    "remote-disconnected": "#ef4444",
    disconnected: "#ef4444",
  };

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

  function guestUiStrings() {
    return GUEST_UI_STRINGS[currentGuestLanguage()] || GUEST_UI_STRINGS.en;
  }

  function applyGuestUiLanguage() {
    const t = guestUiStrings();
    welcomeCopyEl.textContent = t.welcomeCopy;
    safetyItem1El.textContent = t.safetyItem1;
    safetyItem2El.textContent = t.safetyItem2;
    safetyItem3El.textContent = t.safetyItem3;
    langLabelEl.textContent = t.yourLanguageLabel;
    startButtonEl.textContent = t.startButton;
    inputEl.placeholder = t.inputPlaceholder;
    reconnectButtonEl.textContent = t.reconnectButton;
    renderConnectionState();
  }

  langSelectEl.value = detectInitialLanguage();
  applyGuestUiLanguage();
  langSelectEl.addEventListener("change", applyGuestUiLanguage);

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

  function setConnectionState(state, messageKey) {
    currentConnectionState = state;
    currentStatusMessageKey = messageKey;
    renderConnectionState();
  }

  function renderConnectionState() {
    const canSend = currentConnectionState === "connected";
    const t = guestUiStrings();
    statusEl.textContent = t[currentStatusMessageKey];
    statusEl.style.color = STATUS_COLORS[currentConnectionState];
    inputEl.disabled = !canSend;
    sendButtonEl.disabled = !canSend;
    reconnectButtonEl.hidden = currentConnectionState !== "disconnected";
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
    setConnectionState("connecting", "statusConnecting");

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
        setConnectionState("connected", "statusConnected");
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
        setConnectionState("remote-disconnected", "statusRemoteDisconnected");
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
          setConnectionState("disconnected", "statusSignalingFailed");
          console.log("⚠️ シグナリング部屋への接続に失敗しました");
        } else if (status === "TIMED_OUT") {
          setConnectionState("disconnected", "statusSignalingTimeout");
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
        setConnectionState("disconnected", "statusPeerDisconnected");
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
