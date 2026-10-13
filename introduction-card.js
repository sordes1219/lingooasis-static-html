(function () {
  const LABELS = {
    zh: { title: "自我介绍卡", save: "保存到通讯录", original: "原文", translation: "译文", name: "姓名", nickname: "昵称", countryOfOrigin: "来自国家/地区", hobbies: "爱好", personalEmail: "个人邮箱", personalPhone: "个人电话", company: "公司/组织", department: "部门", jobTitle: "职位", workEmail: "工作邮箱", workPhone: "工作电话", website: "商务网站", businessAddress: "公司地址", socialProfiles: "社交账号" },
    es: { title: "Tarjeta de presentación", save: "Guardar en contactos", original: "Original", translation: "Traducción", name: "Nombre", nickname: "Apodo", countryOfOrigin: "País de origen", hobbies: "Aficiones", personalEmail: "Correo personal", personalPhone: "Teléfono personal", company: "Empresa / organización", department: "Departamento", jobTitle: "Cargo", workEmail: "Correo de trabajo", workPhone: "Teléfono de trabajo", website: "Sitio web profesional", businessAddress: "Dirección de empresa", socialProfiles: "Redes sociales" },
    en: { title: "Introduction card", save: "Save to contacts", original: "Original", translation: "Translation", name: "Name", nickname: "Nickname", countryOfOrigin: "Country of origin", hobbies: "Hobbies", personalEmail: "Personal email", personalPhone: "Personal phone", company: "Company / organization", department: "Department", jobTitle: "Job title", workEmail: "Work email", workPhone: "Work phone", website: "Business website", businessAddress: "Business address", socialProfiles: "Social profiles" },
    hi: { title: "परिचय कार्ड", save: "संपर्कों में सहेजें", original: "मूल", translation: "अनुवाद", name: "नाम", nickname: "उपनाम", countryOfOrigin: "मूल देश", hobbies: "शौक", personalEmail: "व्यक्तिगत ईमेल", personalPhone: "व्यक्तिगत फ़ोन", company: "कंपनी / संगठन", department: "विभाग", jobTitle: "पद", workEmail: "कार्य ईमेल", workPhone: "कार्य फ़ोन", website: "व्यावसायिक वेबसाइट", businessAddress: "व्यावसायिक पता", socialProfiles: "सोशल प्रोफ़ाइल" },
    pt: { title: "Cartão de apresentação", save: "Salvar nos contatos", original: "Original", translation: "Tradução", name: "Nome", nickname: "Apelido", countryOfOrigin: "País de origem", hobbies: "Hobbies", personalEmail: "E-mail pessoal", personalPhone: "Telefone pessoal", company: "Empresa / organização", department: "Departamento", jobTitle: "Cargo", workEmail: "E-mail profissional", workPhone: "Telefone profissional", website: "Site comercial", businessAddress: "Endereço comercial", socialProfiles: "Redes sociais" },
    ru: { title: "Карточка знакомства", save: "Сохранить в контакты", original: "Оригинал", translation: "Перевод", name: "Имя", nickname: "Псевдоним", countryOfOrigin: "Страна происхождения", hobbies: "Увлечения", personalEmail: "Личная почта", personalPhone: "Личный телефон", company: "Компания / организация", department: "Отдел", jobTitle: "Должность", workEmail: "Рабочая почта", workPhone: "Рабочий телефон", website: "Сайт компании", businessAddress: "Адрес компании", socialProfiles: "Социальные сети" },
    ja: { title: "自己紹介カード", save: "連絡先に保存", original: "原文", translation: "翻訳", name: "名前", nickname: "ニックネーム", countryOfOrigin: "出身国・地域", hobbies: "趣味", personalEmail: "個人用メール", personalPhone: "個人用電話番号", company: "会社・組織名", department: "部署", jobTitle: "役職・肩書き", workEmail: "仕事用メール", workPhone: "仕事用電話番号", website: "会社・事業の Web サイト", businessAddress: "会社住所", socialProfiles: "SNS" },
    fr: { title: "Carte de présentation", save: "Enregistrer dans les contacts", original: "Original", translation: "Traduction", name: "Nom", nickname: "Surnom", countryOfOrigin: "Pays d’origine", hobbies: "Loisirs", personalEmail: "E-mail personnel", personalPhone: "Téléphone personnel", company: "Entreprise / organisation", department: "Service", jobTitle: "Fonction", workEmail: "E-mail professionnel", workPhone: "Téléphone professionnel", website: "Site professionnel", businessAddress: "Adresse professionnelle", socialProfiles: "Réseaux sociaux" },
    de: { title: "Vorstellungskarte", save: "In Kontakten speichern", original: "Original", translation: "Übersetzung", name: "Name", nickname: "Spitzname", countryOfOrigin: "Herkunftsland", hobbies: "Hobbys", personalEmail: "Private E-Mail", personalPhone: "Privates Telefon", company: "Unternehmen / Organisation", department: "Abteilung", jobTitle: "Position", workEmail: "Geschäftliche E-Mail", workPhone: "Geschäftliches Telefon", website: "Unternehmenswebsite", businessAddress: "Geschäftsadresse", socialProfiles: "Soziale Profile" },
    ko: { title: "자기소개 카드", save: "연락처에 저장", original: "원문", translation: "번역", name: "이름", nickname: "별명", countryOfOrigin: "출신 국가/지역", hobbies: "취미", personalEmail: "개인 이메일", personalPhone: "개인 전화번호", company: "회사 / 조직", department: "부서", jobTitle: "직책", workEmail: "업무 이메일", workPhone: "업무 전화번호", website: "회사 웹사이트", businessAddress: "회사 주소", socialProfiles: "소셜 프로필" },
    vi: { title: "Thẻ giới thiệu", save: "Lưu vào danh bạ", original: "Bản gốc", translation: "Bản dịch", name: "Tên", nickname: "Tên gọi", countryOfOrigin: "Quốc gia xuất xứ", hobbies: "Sở thích", personalEmail: "Email cá nhân", personalPhone: "Điện thoại cá nhân", company: "Công ty / tổ chức", department: "Phòng ban", jobTitle: "Chức danh", workEmail: "Email công việc", workPhone: "Điện thoại công việc", website: "Trang web công ty", businessAddress: "Địa chỉ công ty", socialProfiles: "Mạng xã hội" },
    it: { title: "Biglietto di presentazione", save: "Salva nei contatti", original: "Originale", translation: "Traduzione", name: "Nome", nickname: "Soprannome", countryOfOrigin: "Paese di origine", hobbies: "Hobby", personalEmail: "Email personale", personalPhone: "Telefono personale", company: "Azienda / organizzazione", department: "Reparto", jobTitle: "Ruolo", workEmail: "Email di lavoro", workPhone: "Telefono di lavoro", website: "Sito aziendale", businessAddress: "Indirizzo aziendale", socialProfiles: "Profili social" },
    th: { title: "บัตรแนะนำตัว", save: "บันทึกในรายชื่อ", original: "ต้นฉบับ", translation: "คำแปล", name: "ชื่อ", nickname: "ชื่อเล่น", countryOfOrigin: "ประเทศต้นทาง", hobbies: "งานอดิเรก", personalEmail: "อีเมลส่วนตัว", personalPhone: "โทรศัพท์ส่วนตัว", company: "บริษัท / องค์กร", department: "แผนก", jobTitle: "ตำแหน่ง", workEmail: "อีเมลงาน", workPhone: "โทรศัพท์งาน", website: "เว็บไซต์ธุรกิจ", businessAddress: "ที่อยู่ธุรกิจ", socialProfiles: "โซเชียลโปรไฟล์" },
  };

  const escapeText = (value) =>
    String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

  function safeUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch {
      return "";
    }
  }

  function phoneUri(value) {
    const raw = String(value || "").trim();
    const normalized = raw.replace(/[^0-9+*#]/g, "");
    return normalized ? "tel:" + normalized : "";
  }

  function makeVCard(content, labels) {
    const lines = ["BEGIN:VCARD", "VERSION:4.0"];
    const has = (field) => content.includedFields.includes(field);
    const add = (key, value) => {
      if (value) lines.push(key + ":" + escapeText(value));
    };
    if (has("name")) add("FN", content.name);
    if (has("nickname")) add("NICKNAME", content.nickname);
    if (has("personalEmail")) add("EMAIL;TYPE=HOME,INTERNET", content.personalEmail);
    if (has("workEmail")) add("EMAIL;TYPE=WORK,INTERNET", content.workEmail);
    if (has("personalPhone")) {
      const tel = phoneUri(content.personalPhone);
      if (tel) lines.push("TEL;VALUE=uri;TYPE=cell:" + tel);
    }
    if (has("workPhone")) {
      const tel = phoneUri(content.workPhone);
      if (tel) lines.push("TEL;VALUE=uri;TYPE=work:" + tel);
    }
    if (has("company") || has("department")) {
      const organization = [content.company, content.department]
        .filter(Boolean)
        .map(escapeText)
        .join(";");
      if (organization) lines.push("ORG:" + organization);
    }
    if (has("jobTitle")) add("TITLE", content.jobTitle);
    if (has("website")) {
      const url = safeUrl(content.website);
      if (url) lines.push("URL:" + url);
    }
    if (has("businessAddress") && content.businessAddress) {
      const address = content.businessAddress;
      const region = [address.prefecture, address.region].filter(Boolean).join(" ");
      const values = ["", "", address.street, address.city, region, address.postalCode, address.country];
      if (values.slice(2).some(Boolean)) {
        lines.push("ADR;TYPE=WORK:" + values.map(escapeText).join(";"));
      }
    }
    if (has("socialProfiles")) {
      (content.socialProfiles || []).forEach((item) => {
        const url = safeUrl(item.url);
        const service = String(item.service || "social").replace(/[^A-Za-z0-9-]/g, "") || "social";
        if (url) {
          lines.push("SOCIALPROFILE;TYPE=" + service + ";VALUE=uri:" + url);
        } else if (item.username) {
          lines.push("SOCIALPROFILE;TYPE=" + service + ";VALUE=text:" + escapeText(item.username));
        }
      });
    }
    const notes = [];
    if (has("countryOfOrigin") && content.countryOfOrigin) {
      notes.push("Country of origin: " + content.countryOfOrigin);
    }
    if (has("hobbies")) {
      if (content.hobbiesOriginal) notes.push(labels.hobbies + ": " + content.hobbiesOriginal);
    }
    if (notes.length) add("NOTE", notes.join("\n"));
    lines.push("END:VCARD");
    return lines.join("\r\n") + "\r\n";
  }

  async function saveContact(content, labels, button) {
    const card = makeVCard(content, labels);
    const name = String(content.name || "contact").replace(/[\\/:*?"<>|]/g, "_");
    const fileName = (name || "contact") + ".vcf";
    const file = new File([card], fileName, { type: "text/vcard;charset=utf-8" });
    try {
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: labels.title });
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([card], { type: "text/vcard;charset=utf-8" }));
      link.download = fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      button.textContent = labels.retry;
      setTimeout(() => (button.textContent = labels.save), 2200);
    }
  }

  window.renderIntroductionCard = function (content, language, container, type) {
    const labels = LABELS[language] || LABELS.en;
    const bubble = document.createElement("article");
    bubble.className = "bubble contact-card " + (type || "received");
    const title = document.createElement("div");
    title.className = "contact-card-title";
    title.textContent = labels.title;
    bubble.appendChild(title);

    const textRow = (label, value) => {
      if (!value) return;
      const row = document.createElement("div");
      row.className = "contact-card-row";
      const caption = document.createElement("div");
      caption.className = "contact-card-label";
      caption.textContent = label;
      const detail = document.createElement("div");
      detail.className = "contact-card-value";
      detail.textContent = value;
      row.append(caption, detail);
      bubble.appendChild(row);
    };

    content.includedFields.forEach((field) => {
      if (field === "hobbies") {
        textRow(labels.hobbies, [content.hobbiesOriginal, content.hobbiesTranslated && content.hobbiesTranslated !== content.hobbiesOriginal ? content.hobbiesTranslated : ""].filter(Boolean).join("\n"));
      } else if (field === "businessAddress" && content.businessAddress) {
        const address = content.businessAddress;
        textRow(labels.businessAddress, [address.street, address.city, address.prefecture, address.region, address.postalCode, address.country].filter(Boolean).join(", "));
      } else if (field === "socialProfiles") {
        textRow(labels.socialProfiles, (content.socialProfiles || []).map((item) => [item.service, item.username, item.url].filter(Boolean).join(" · ")).filter(Boolean).join("\n"));
      } else {
        textRow(labels[field] || field, content[field]);
      }
    });

    const button = document.createElement("button");
    button.className = "contact-card-save";
    button.type = "button";
    button.textContent = labels.save;
    button.addEventListener("click", () => void saveContact(content, { ...labels, retry: labels.retry || labels.save, title: labels.title }, button));
    bubble.appendChild(button);
    container.appendChild(bubble);
    container.parentElement.scrollTop = container.parentElement.scrollHeight;
  };
})();
