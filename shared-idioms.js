/*
 * اصطلاح‌ها و ساختارهای گفتاری.
 * همه‌ی بازدیدکنندگان نسخه‌ی یکسان را می‌بینند؛ برای ویرایش این فایل را در مخزن تغییر دهید.
 * جمله‌های آمیخته‌ی فارسی و انگلیسی را با بخش‌های دارای lang جدا کنید.
 */
window.REPOSITORY_IDIOMS = [
  {
    id: 'like-what-number',
    phrase: 'like, what, [number]?',
    meaning: 'مثلاً... حدودِ چند؟ / یعنی مثلاً ده دقیقه؟',
    explanation: [
      { text: 'یک جور مکث و حدس‌زدنِ خودمانی است. ', lang: 'fa' },
      { text: 'like', lang: 'en' },
      { text: ' و ', lang: 'fa' },
      { text: 'what', lang: 'en' },
      { text: ' اینجا بیشتر پُرکننده‌ی گفتارند و لازم نیست جداگانه ترجمه شوند. بسته به لحن می‌تواند تعجب یا تردید هم برساند. مثال: «مثلاً... ده دقیقه؟»', lang: 'fa' }
    ],
    example: 'Like, what, ten minutes?',
    register: 'محاوره‌ای'
  },
  {
    id: 'and-all-but',
    phrase: '... and all, but ...',
    meaning: '... خوبه و این حرف‌ها، ولی ... / ... قبول، اما ...',
    explanation: [
      { text: 'اول حرف یا خوبیِ کسی را تا حدی می‌پذیری، بعد با ', lang: 'fa' },
      { text: 'but', lang: 'en' },
      { text: ' نکته‌ی اصلی یا انتقادت را می‌گویی. معنی دقیق به چیزی بستگی دارد که پیش از ', lang: 'fa' },
      { text: 'and all', lang: 'en' },
      { text: ' آمده. مثال: «برایان خیلی هم آدم خوبیه و این حرف‌ها، ولی کار کردن باهاش گاهی سخته.»', lang: 'fa' }
    ],
    example: "Brian's great and all, but he can be hard to work with.",
    register: 'خودمانی'
  },
  {
    id: 'go-and-verb',
    phrase: 'go and + verb',
    meaning: 'برو و ... را انجام بده؛ خودمانی‌تر: برو ... کن',
    explanation: [
      { text: 'گاهی منظور واقعاً رفتن و بعد انجام‌دادن کاری است؛ گاهی ', lang: 'fa' },
      { text: 'go and', lang: 'en' },
      { text: ' فقط جمله را محاوره‌ای‌تر یا کمی تأکیدی می‌کند. مثال: «برو دنبالشون و بیارشون.»', lang: 'fa' }
    ],
    example: "Go and pick 'em up.",
    register: 'گفتاری'
  },
  {
    id: 'mess-around-about',
    phrase: 'mess around / mess about',
    meaning: 'علافی یا وقت‌کشی کردن؛ ور رفتن با چیزی؛ شیطنت یا شوخی کردن',
    explanation: [
      { text: 'این‌ها چند کاربرد دارند و ترجمه با موقعیت عوض می‌شود. ', lang: 'fa' },
      { text: 'mess about', lang: 'en' },
      { text: ' رایج‌تر در انگلیسی بریتانیایی است؛ ', lang: 'fa' },
      { text: 'mess around', lang: 'en' },
      { text: ' در انگلیسی آمریکایی هم بسیار رایج است. ', lang: 'fa' },
      { text: 'mess around with a device', lang: 'en' },
      { text: ' یعنی با دستگاه ور رفتن، نه لزوماً خراب‌کاری کردن.', lang: 'fa' }
    ],
    example: 'Stop messing about and get ready.',
    register: 'خودمانی'
  },
  {
    id: 'youd-better',
    phrase: "You'd better + verb",
    meaning: 'بهتره ...؛ بسته به لحن: حواست باشه که ...',
    explanation: [
      { text: 'شکل معیار و رایج در نوشتار، ', lang: 'fa' },
      { text: "You'd better", lang: 'en' },
      { text: ' است؛ ', lang: 'fa' },
      { text: "you'd", lang: 'en' },
      { text: ' اینجا کوتاه‌شده‌ی ', lang: 'fa' },
      { text: 'you had', lang: 'en' },
      { text: ' است و بعدش فعل ساده می‌آید، نه ', lang: 'fa' },
      { text: 'to + verb', lang: 'en' },
      { text: '. در گفتار خودمانی گاهی ', lang: 'fa' },
      { text: 'had', lang: 'en' },
      { text: ' را می‌اندازند و می‌گویند ', lang: 'fa' },
      { text: 'You better', lang: 'en' },
      { text: '. این ساختار می‌تواند نصیحت جدی یا هشدار باشد؛ تهدید بودنش به لحن و موقعیت بستگی دارد. ', lang: 'fa' },
      { text: "You'd better get out of here", lang: 'en' },
      { text: ' یعنی «بهتره از اینجا بزنی به چاک.»', lang: 'fa' }
    ],
    example: "You'd better get out of here.",
    register: 'گفتاری؛ گاهی هشدارآمیز'
  },
  {
    id: 'happy-hunting',
    phrase: 'Happy hunting!',
    meaning: 'موفق باشی توی گشتن و پیداکردنش!؛ موفق باشی!',
    explanation: 'معمولاً برای آرزوی موفقیت به کسی گفته می‌شود که دنبال چیزی می‌گردد؛ لازم نیست واقعاً شکار کند. اگر صحبت از شکار واقعی باشد، می‌تواند معنی تحت‌اللفظی داشته باشد.',
    example: "I'm looking for a new apartment. — Happy hunting!",
    register: 'دوستانه'
  },
  {
    id: 'on-someones-ass',
    phrase: "be on someone's ass",
    meaning: 'ول‌کنِ کسی نبودن؛ مدام بهش گیر دادن یا تحت فشار گذاشتنش',
    explanation: 'عبارتی خیلی خودمانی و رکیک است؛ برای موقعیت رسمی مناسب نیست. معمولاً منظور پیگیری سمجانه، غرزدن یا فشارآوردن است، نه معنی تحت‌اللفظی. مثال: «مسئول پرونده‌م بابت فرم‌ها مدام بهم گیر می‌ده.»',
    example: "My case officer's on my ass about the forms.",
    register: 'رکیک و خیلی خودمانی'
  },
  {
    id: 'on-top-of-addition',
    phrase: 'on top of + noun',
    meaning: 'علاوه برِ ...؛ تازه ... هم',
    explanation: [
      { text: 'در این معنی چیزی به مورد قبلی اضافه می‌شود. مثال: «علاوه بر اجاره، قبض‌ها را هم باید بدهیم.» عبارت ', lang: 'fa' },
      { text: 'on top of the accounts', lang: 'en' },
      { text: ' به‌تنهایی مبهم است و برای ترجمه‌ی دقیق، جمله‌ی کامل لازم است.', lang: 'fa' }
    ],
    example: 'On top of the rent, we have utility bills to pay.',
    register: 'معمولی'
  },
  {
    id: 'stay-on-top-of',
    phrase: 'be / stay on top of something',
    meaning: 'حواس‌جمع و مسلطِ کاری بودن؛ کارها را به‌روز و تحت کنترل نگه‌داشتن',
    explanation: [
      { text: 'با معنی «علاوه برِ» فرق دارد. ', lang: 'fa' },
      { text: 'stay on top of your accounts', lang: 'en' },
      { text: ' یعنی «حواست به حساب‌وکتاب‌هایت باشد و مرتب پیگیری‌شان کن».', lang: 'fa' }
    ],
    example: 'I need to stay on top of my accounts.',
    register: 'معمولی'
  },
  {
    id: 'were-fucked',
    phrase: "We're fucked. / We are fucked.",
    meaning: 'کارمون ساخته‌ست؛ بدجوری گیر افتادیم؛ خیلی رکیک‌تر: بدجوری به گا رفتیم',
    explanation: 'عبارتی بسیار رکیک و خیلی خودمانی برای گفتن اینکه اوضاع فاجعه‌بار است یا احتمالاً راه چاره‌ای نمانده. نسخه‌های ملایم‌تر: «کارمون ساخته‌ست» یا «بدجوری تو دردسریم».',
    example: "If they find the evidence, we're fucked.",
    register: 'رکیک و خیلی خودمانی'
  },
  {
    id: 'or-either-negative',
    phrase: '... or [something], either',
    meaning: 'در جمله‌ی منفی: «... یا حتی ... هم نه»؛ «... هم نمی‌شود/نداری»',
    explanation: [
      { text: 'در پایان جمله‌ی منفی، ', lang: 'fa' },
      { text: 'either', lang: 'en' },
      { text: ' معمولاً معنی «هم» می‌دهد. این ساختار به‌تنهایی تهدید نیست؛ لحن تهدید از جمله و موقعیت می‌آید. اگر کسی فقط بگوید ', lang: 'fa' },
      { text: '“Or your air, either!”', lang: 'en' },
      { text: '، این تکه‌جمله است و بدون جمله‌ی قبل ترجمه‌ی قطعی ندارد.', lang: 'fa' }
    ],
    example: "You won't get a warning—or a second chance, either.",
    register: 'گفتاری؛ وابسته به بافت'
  },
  {
    id: 'get-imperative',
    phrase: 'Get!',
    meaning: 'گمشو!؛ برو پی کارت!؛ بسته به موقعیت: بجنب و راه بیفت!',
    explanation: [
      { text: 'اگر با لحن تند به کسی گفته شود، معمولاً یعنی «برو بیرون/گمشو». اگر منظور حرکت‌کردن باشد، می‌تواند «بجنب/راه بیفت» باشد. در ', lang: 'fa' },
      { text: "You'd better get!", lang: 'en' },
      { text: ' معنی معمولاً «بهتره بزنی به چاک/راه بیفتی» است؛ ', lang: 'fa' },
      { text: 'get out', lang: 'en' },
      { text: ' کامل‌تر و روشن‌تر است.', lang: 'fa' }
    ],
    example: 'The farmer shouted “Get!” at the stray dog.',
    register: 'امری و تند'
  }
];
