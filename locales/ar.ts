export default {
    appTitle: "مساعد Nix 1 الذكي",
    chatHistory: "سجل المحادثات",
    newChat: "محادثة جديدة",
    settings: "الإعدادات",
    clearHistory: "مسح كل السجل",
    welcomeMessage: "كيف يمكنني مساعدتك اليوم؟",
    chatPlaceholder: "اسألني أي شيء، أو اكتب '/' لعرض الأوامر...",
    sendMessage: "إرسال",
    errorPrefix: "خطأ:",
    // Settings Modal
    settingsTitle: "الإعدادات",
    theme: "المظهر",
    light: "فاتح",
    dark: "داكن",
    language: "اللغة",
    english: "الإنجليزية",
    arabic: "العربية",
    saveChatHistory: "حفظ سجل المحادثات",
    saveHistoryDescription: "حفظ محادثاتك تلقائيًا على جهازك.",
    close: "إغلاق",
    // Commands
    helpCommandName: "/مساعدة",
    helpCommandDescription: "يعرض رسالة المساعدة.",
    imageCommandName: "/صورة",
    imageCommandDescription: "ينشئ صورة من وصف نصي.",
    voiceCommandName: "/صوت",
    voiceCommandDescription: "يرد بصوت منطوق.",
    jokeCommandName: "/نكتة",
    jokeCommandDescription: "يروي نكتة عشوائية.",
    storyCommandName: "/قصة",
    storyCommandDescription: "يكتب قصة قصيرة.",
    searchCommandName: "/بحث",
    searchCommandDescription: "يبحث في الويب عن معلومات.",
    deepresearchCommandName: "/بحث_عميق",
    deepresearchCommandDescription: "يجري بحثًا معمقًا.",
    articleCommandName: "/مقالة",
    articleCommandDescription: "ينشئ مقالة متكاملة.",
    roleCommandName: "/دور",
    roleCommandDescription: "يحدد شخصية المساعد لهذه المحادثة.",
    clearCommandName: "/مسح",
    clearCommandDescription: "يبدأ جلسة محادثة جديدة.",
    // Gemini Service
    defaultSystemInstruction: `أنت مساعد ذكاء اصطناعي ودود ومتعاون اسمك Nix.
- إذا طلب المستخدم كودًا برمجيًا، يجب عليك وضعه داخل علامات المارくだون مع تحديد اللغة (مثال: \`\`\`javascript).
- حافظ على إجاباتك مختصرة ومفيدة.`,
    helpMessage: `الأوامر المتاحة هي:
- \`/مساعدة\`: يعرض رسالة المساعدة هذه.
- \`/صورة <وصف> [--ar <نسبة>]\`: ينشئ صورة.
    - يمكنك تحديد الأنماط الفنية مثل "بأسلوب فان جوخ".
    - استخدم \`--ar\` لتحديد نسبة العرض إلى الارتفاع. النسب المدعومة: 1:1, 16:9, 9:16, 4:3, 3:4.
    - مثال: \`/صورة قطة --ar 16:9\`
- \`/صوت <نص>\`: يرد بنصك بصوت منطوق.
- \`/نكتة\`: يروي نكتة عشوائية.
- \`/قصة [موضوع]\`: يكتب قصة قصيرة، ويمكن تحديد موضوعها.
- \`/بحث <استعلام>\`: يبحث في الويب عن معلومات حديثة.
- \`/بحث_عميق <موضوع>\`: يجري بحثًا معمقًا ويقدم ملخصًا مع المصادر.
- \`/مقالة <موضوع>\`: ينشئ مقالة متكاملة حول موضوع معين.
- \`/دور <شخصية>\`: يحدد شخصية للمساعد في المحادثة الحالية. مثال: \`/دور أنت قرصان\`
- \`/مسح\`: يبدأ جلسة محادثة جديدة.`,
    imagePromptMissing: "يرجى تقديم وصف للصورة.",
    voicePromptMissing: "يرجى تقديم نص لأقوم بنطقه.",
    searchQueryMissing: "يرجى تقديم استعلام بحث بعد /بحث.",
    researchTopicMissing: "يرجى تقديم موضوع للبحث المعمق بعد /بحث_عميق.",
    articleTopicMissing: "يرجى تقديم موضوع للمقالة بعد /مقالة.",
    jokePrompt: "أخبرني نكتة.",
    storyPrompt: "أخبرني قصة قصيرة.",
    storyTopicPrompt: "أخبرني قصة قصيرة عن {0}.",
    deepResearchPrompt: 'قم بإجراء بحث معمق حول الموضوع التالي: "{0}". اجمع المعلومات من مصادر متعددة، وحدد النقاط الرئيسية، وقدم ملخصًا شاملاً ومفصلاً.',
    articleSystemInstruction: `{0}

بغض النظر عن شخصيتك الحالية، مهمتك الأساسية هي إنشاء مقالة جيدة التنظيم وغنية بالمعلومات حول الموضوع المحدد.
يجب أن تتضمن المقالة:
1. عنوان واضح وجذاب (باستخدام تنسيق ماركداون مثل '# العنوان').
2. مقدمة موجزة تجذب القارئ.
3. متن المقالة مع عدة فقرات، باستخدام عناوين فرعية لتنظيم الأقسام عند الحاجة.
4. فقرة ختامية تلخص النقاط الرئيسية.`,
    roleSetConfirmation: "حسنًا، سأقوم الآن بدور: {0}",
    unexpectedError: "حدث خطأ غير متوقع.",
    confirmClearHistory: "هل أنت متأكد من أنك تريد حذف كل سجل المحادثات؟ لا يمكن التراجع عن هذا الإجراء."
};
