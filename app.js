const SITE_CONFIG = {
  formUrl: ""
};

const FALLBACK_FORM_TARGET = "#apply";

const FALLBACK_FAQ = [
  {
    id: 1,
    question: "cohere 青年共创社区是做什么的？",
    keywords: ["cohere", "社区", "做什么", "介绍", "是什么"],
    category: "社区介绍",
    answer: "这里更像一个共居共创社区，不只是住的地方。你可以先了解氛围、空间和活动，再决定要不要来。",
    images: ["assets/images/hero/hero-01.jpg"],
    priority: 10
  },
  {
    id: 2,
    question: "什么样的人适合来这里？",
    keywords: ["适合", "谁适合", "什么样的人", "适合来"],
    category: "适合谁来",
    answer: "如果你想住进一个不只是落脚点的地方，想认识一些有意思的人，也愿意尊重共同生活节奏，这里会比较适合。",
    images: ["assets/images/life/life-01.jpg"],
    priority: 10
  },
  {
    id: 3,
    question: "怎么申请？",
    keywords: ["申请", "报名", "表单", "怎么来"],
    category: "申请方式",
    answer: "建议先走表单，如果还有拿不准的地方，再通过微信做补充沟通。",
    images: [],
    priority: 10
  },
  {
    id: 4,
    question: "可以短住吗？",
    keywords: ["短住", "住多久", "几天", "一周"],
    category: "入住前",
    answer: "可以先短住了解，不过如果你想真正感受节奏，一周通常会比两三天更容易进入状态。",
    images: [],
    priority: 8
  },
  {
    id: 5,
    question: "第一次来要注意什么？",
    keywords: ["第一次来", "注意什么", "入住前", "新朋友"],
    category: "入住前",
    answer: "先想清楚自己是不是想体验社区生活，而不只是找个落脚点；其余问题都可以先问。",
    images: ["assets/images/hero/hero-02.jpg"],
    priority: 9
  },
  {
    id: 6,
    question: "房间和公共空间大概长什么样？",
    keywords: ["房间", "空间", "公共空间", "照片", "环境"],
    category: "空间介绍",
    answer: "页面里已经预留了空间和活动图片区位。你后续把真实照片替换进去，会比写很多形容词更有用。",
    images: ["assets/images/space/space-01.jpg", "assets/images/space/space-02.jpg"],
    priority: 9
  }
];

const DEFAULT_RECOMMENDED_QUESTIONS = [
  "cohere 青年共创社区是做什么的？",
  "什么样的人适合来这里？",
  "第一次来，入住前要先知道什么？",
  "社区平时会有什么活动？",
  "怎么申请或预定？",
  "房间和公共空间大概长什么样？",
  "附近生活方便吗？",
  "可以短住吗？",
  "如果我比较内向，也适合来吗？",
  "如果我还有拿不准的问题，可以先不填表吗？"
];

const STOP_WORDS = [
  "的", "了", "吗", "呢", "啊", "呀", "吧", "我", "你", "他", "她", "它",
  "我们", "你们", "他们", "请问", "一下", "一个", "这个", "那个", "就是",
  "想", "要", "能", "可以", "是不是", "还有", "然后", "怎么", "什么", "一下子",
  "这里", "那边", "一下哦", "一下哈"
];

let faqData = [];

document.addEventListener("DOMContentLoaded", () => {
  applyFormLinks();
  installImageFallbacks(document);
  installRevealEffects();
  installScrollProgress();
  initChat();
  loadFaq();
});

function initChat() {
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");

  if (!chatForm || !userInput) {
    return;
  }

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = userInput.value.trim();

    if (!text) {
      userInput.focus();
      return;
    }

    handleAsk(text);
  });
}

function applyFormLinks() {
  const metaUrl = document.querySelector('meta[name="cohere-form-url"]')?.content?.trim() || "";
  const resolvedUrl = isValidExternalUrl(SITE_CONFIG.formUrl)
    ? SITE_CONFIG.formUrl.trim()
    : isValidExternalUrl(metaUrl)
      ? metaUrl
      : "";

  const formLinks = document.querySelectorAll("[data-form-link]");
  const formStatusNote = document.getElementById("formStatusNote");
  const applyNote = document.getElementById("applyNote");

  formLinks.forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }

    if (resolvedUrl) {
      link.href = resolvedUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.href = FALLBACK_FORM_TARGET;
      link.removeAttribute("target");
      link.removeAttribute("rel");
    }
  });

  if (formStatusNote) {
    formStatusNote.textContent = resolvedUrl
      ? "报名表链接已经配置好了，按钮会直接打开外部表单。"
      : "你还没配置外部报名表链接。页面仍可直接部署使用，按钮会先跳到页面内的报名说明和联系入口。";
  }

  if (applyNote) {
    applyNote.textContent = resolvedUrl
      ? "报名按钮已经连接到外部表单；如果还有拿不准的问题，也可以先扫二维码补充沟通。"
      : "当前还没有配置外部表单链接，所以报名按钮会先留在站内。上线前把 meta 里的 cohere-form-url 换成你的正式表单链接就可以了。";
  }
}

function loadFaq() {
  const faqStatus = document.getElementById("faqStatus");

  if (faqStatus) {
    faqStatus.textContent = "正在加载常见问题…";
  }

  fetch("./data/faq.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`FAQ request failed: ${response.status}`);
      }

      return response.text();
    })
    .then((text) => {
      const parsed = JSON.parse(text);
      const sanitized = sanitizeFaqData(parsed);

      if (!sanitized.length) {
        throw new Error("FAQ data is empty after sanitize");
      }

      faqData = sanitized;
      renderQuestionChips();

      if (faqStatus) {
        faqStatus.textContent = `已加载 ${faqData.length} 条常见问题。`;
      }
    })
    .catch((error) => {
      faqData = FALLBACK_FAQ;
      renderQuestionChips();

      if (faqStatus) {
        faqStatus.textContent = "FAQ 文件没有正常加载，已切换到内置简版 FAQ。";
      }

      addBotMessage(
        "FAQ 文件刚刚没有正常加载，我先切到内置简版问答了。你还是可以继续问常见问题。",
        []
      );

      console.error("加载 FAQ 失败：", error);
    });
}

function sanitizeFaqData(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item, index) => ({
      id: Number.isFinite(item?.id) ? item.id : index + 1,
      question: typeof item?.question === "string" ? item.question.trim() : "",
      keywords: Array.isArray(item?.keywords)
        ? item.keywords.filter((keyword) => typeof keyword === "string" && keyword.trim()).map((keyword) => keyword.trim())
        : [],
      category: typeof item?.category === "string" ? item.category.trim() : "",
      answer: typeof item?.answer === "string" ? item.answer.trim() : "",
      images: Array.isArray(item?.images)
        ? item.images.filter((src) => typeof src === "string" && src.trim()).map((src) => src.trim())
        : [],
      priority: Number.isFinite(item?.priority) ? item.priority : 0
    }))
    .filter((item) => item.question && item.answer);
}

function renderQuestionChips() {
  const questionChips = document.getElementById("questionChips");
  const userInput = document.getElementById("userInput");

  if (!questionChips) {
    return;
  }

  const sourceQuestions = faqData.length
    ? faqData
        .slice()
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .slice(0, 10)
        .map((item) => item.question)
    : DEFAULT_RECOMMENDED_QUESTIONS;

  const selectedQuestions = shuffle(sourceQuestions).slice(0, 6);

  questionChips.innerHTML = "";

  selectedQuestions.forEach((question) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = question;
    button.addEventListener("click", () => {
      button.classList.add("is-active-card");
      window.setTimeout(() => button.classList.remove("is-active-card"), 500);
      if (userInput) {
        userInput.value = question;
      }
      handleAsk(question);
    });
    questionChips.appendChild(button);
  });
}

function handleAsk(text) {
  const userInput = document.getElementById("userInput");
  addUserMessage(text);

  if (userInput) {
    userInput.value = "";
    userInput.focus();
  }

  const match = findBestMatch(text);

  if (match) {
    addBotMessage(match.answer, match.images || []);
    return;
  }

  addBotMessage(
    "这个问题我先没完全接住。你可以换个说法再试试，比如问“怎么申请”“短住可以吗”“这里适合什么样的人”“第一次来要注意什么”。如果你想更快确认，也可以先看底部报名说明或直接微信咨询。",
    []
  );
}

function addUserMessage(text) {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "message user";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  scrollToBottom();
}

function addBotMessage(text, images = []) {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "message bot";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const textBlock = document.createElement("div");
  textBlock.textContent = text;
  bubble.appendChild(textBlock);

  if (Array.isArray(images) && images.length) {
    const imageWrap = document.createElement("div");
    imageWrap.className = "answer-images";

    images.forEach((src, index) => {
      const image = document.createElement("img");
      image.src = src;
      image.alt = `回答相关图片 ${index + 1}`;
      image.className = "smart-image";
      image.dataset.fallbackLabel = "回答图片";
      image.loading = "lazy";
      imageWrap.appendChild(image);
    });

    bubble.appendChild(imageWrap);
    installImageFallbacks(imageWrap);
  }

  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  scrollToBottom();
}

function scrollToBottom() {
  const chatBox = document.getElementById("chatBox");
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function installScrollProgress() {
  const progressBar = document.getElementById("scrollProgress");

  if (!progressBar) {
    return;
  }

  const update = () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;
    progressBar.style.width = `${progress * 100}%`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function installRevealEffects() {
  const revealTargets = [
    ...document.querySelectorAll(".section-head"),
    ...document.querySelectorAll(".feature-card"),
    ...document.querySelectorAll(".list-card"),
    ...document.querySelectorAll(".tip-card"),
    ...document.querySelectorAll(".faq-side"),
    ...document.querySelectorAll(".chat-panel"),
    ...document.querySelectorAll(".media-card"),
    ...document.querySelectorAll(".apply-copy"),
    ...document.querySelectorAll(".contact-card"),
    ...document.querySelectorAll(".hero-copy"),
    ...document.querySelectorAll(".hero-visual")
  ];

  if (!revealTargets.length) {
    return;
  }

  revealTargets.forEach((element, index) => {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    if (!element.dataset.reveal) {
      if (element.classList.contains("hero-copy") || element.classList.contains("apply-copy")) {
        element.dataset.reveal = "left";
      } else if (element.classList.contains("hero-visual") || element.classList.contains("contact-card")) {
        element.dataset.reveal = "right";
      } else {
        element.dataset.reveal = "up";
      }
    }

    element.style.transitionDelay = `${Math.min(index * 35, 240)}ms`;
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.12
    }
  );

  revealTargets.forEach((element) => observer.observe(element));
}

function findBestMatch(question) {
  if (!faqData.length) {
    return null;
  }

  const normalizedQuestion = normalizeText(question);
  const userWords = splitKeywords(question);

  let best = null;
  let bestScore = 0;

  faqData.forEach((item) => {
    const normalizedItemQuestion = normalizeText(item.question);
    const normalizedCategory = normalizeText(item.category || "");
    const normalizedKeywords = (item.keywords || []).map((keyword) => normalizeText(keyword));
    let score = 0;

    if (normalizedQuestion === normalizedItemQuestion) {
      score += 120;
    }

    if (normalizedQuestion.includes(normalizedItemQuestion) || normalizedItemQuestion.includes(normalizedQuestion)) {
      score += 44;
    }

    normalizedKeywords.forEach((keyword) => {
      if (!keyword) {
        return;
      }

      if (normalizedQuestion.includes(keyword)) {
        score += 18;
      }

      userWords.forEach((userWord) => {
        if (keyword === userWord) {
          score += 12;
        } else if (keyword.includes(userWord) || userWord.includes(keyword)) {
          score += 6;
        }
      });
    });

    userWords.forEach((userWord) => {
      if (normalizedItemQuestion.includes(userWord)) {
        score += 7;
      }

      if (normalizedCategory.includes(userWord)) {
        score += 4;
      }
    });

    score += item.priority || 0;

    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  });

  return bestScore >= 20 ? best : null;
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[？?！!。，、,.；;：:“”"'（）()【】\[\]《》<>/\\|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitKeywords(text) {
  const normalized = normalizeText(text);
  const words = normalized.split(" ").filter(Boolean);
  const compact = normalized.replace(/\s+/g, "");
  const grams = [];

  for (let i = 0; i < compact.length; i += 1) {
    for (let len = 2; len <= 4; len += 1) {
      const word = compact.slice(i, i + len);
      if (word.length >= 2) {
        grams.push(word);
      }
    }
  }

  return Array.from(
    new Set(
      [...words, ...grams].filter((word) => word && !STOP_WORDS.includes(word))
    )
  );
}

function shuffle(items) {
  const list = [...items];

  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  return list;
}

function installImageFallbacks(scope = document) {
  const images = scope.querySelectorAll ? scope.querySelectorAll("img.smart-image") : [];

  images.forEach((image) => {
    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    const applyFallback = () => {
      if (image.src.startsWith("data:image/svg+xml")) {
        return;
      }

      const label = image.dataset.fallbackLabel || image.alt || "图片待替换";
      image.src = buildPlaceholderImage(label);
      image.alt = `${label}（占位图）`;
      image.classList.add("is-fallback");
    };

    image.addEventListener("error", applyFallback, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      applyFallback();
    }
  });
}

function buildPlaceholderImage(label) {
  const safeLabel = escapeXml(label);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${safeLabel}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f4ecde" />
          <stop offset="100%" stop-color="#eadbc6" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="48" fill="url(#bg)" />
      <circle cx="190" cy="160" r="120" fill="#ffffff" fill-opacity="0.34" />
      <circle cx="1010" cy="740" r="170" fill="#c65c39" fill-opacity="0.10" />
      <rect x="88" y="96" width="1024" height="708" rx="34" fill="#fffaf4" stroke="#dcc9b3" stroke-width="4" />
      <text x="50%" y="46%" text-anchor="middle" fill="#5b4b3e" font-size="42" font-family="Segoe UI, PingFang SC, Microsoft YaHei, sans-serif">${safeLabel}</text>
      <text x="50%" y="54%" text-anchor="middle" fill="#8a7867" font-size="24" font-family="Segoe UI, PingFang SC, Microsoft YaHei, sans-serif">当前仓库已预留路径，上线前可替换为正式图片</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(text) {
  return String(text || "").replace(/[<>&"']/g, (char) => {
    const map = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return map[char] || char;
  });
}

function isValidExternalUrl(value) {
  if (!value || typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
