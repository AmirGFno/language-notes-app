/*
 * اصطلاح‌ها و ساختارهای گفتاری.
 * همه‌ی بازدیدکنندگان نسخه‌ی یکسان را می‌بینند؛ برای ویرایش این فایل را در مخزن تغییر دهید.
 */
window.REPOSITORY_IDIOMS = [
  {
    id: 'like-what-number',
    phrase: 'like, what, [number]?',
    meaning: 'مثلاً... حدودِ چند؟ / یعنی مثلاً ده دقیقه؟',
    explanation: 'یک جور مکث و حدس‌زدنِ خودمانی است. like و what اینجا بیشتر پُرکننده‌ی گفتارند و لازم نیست جداگانه ترجمه شوند. بسته به لحن می‌تواند تعجب یا تردید هم برساند. مثال: «مثلاً... ده دقیقه؟»',
    example: 'Like, what, ten minutes?',
    register: 'محاوره‌ای'
  },
  {
    id: 'and-all-but',
    phrase: '... and all, but ...',
    meaning: '... خوبه و این حرف‌ها، ولی ... / ... قبول، اما ...',
    explanation: 'اول حرف یا خوبیِ کسی را تا حدی می‌پذیری، بعد با but نکته‌ی اصلی یا انتقادت را می‌گویی. معنی دقیق به چیزی بستگی دارد که پیش از and all آمده. مثال: «برایان خیلی هم آدم خوبیه و این حرف‌ها، ولی کار کردن باهاش گاهی سخته.»',
    example: "Brian's great and all, but he can be hard to work with.",
    register: 'خودمانی'
  },
  {
    id: 'go-and-verb',
    phrase: 'go and + verb',
    meaning: 'برو و ... را انجام بده؛ خودمانی‌تر: برو ... کن',
    explanation: 'گاهی منظور واقعاً رفتن و بعد انجام‌دادن کاری است؛ گاهی go and فقط جمله را محاوره‌ای‌تر یا کمی تأکیدی می‌کند. مثال: «برو دنبالشون و بیارشون.»',
    example: "Go and pick 'em up.",
    register: 'گفتاری'
  },
  {
    id: 'mess-around-about',
    phrase: 'mess around / mess about',
    meaning: 'علافی یا وقت‌کشی کردن؛ ور رفتن با چیزی؛ شیطنت یا شوخی کردن',
    explanation: 'این‌ها چند کاربرد دارند و ترجمه با موقعیت عوض می‌شود. mess about رایج‌تر در انگلیسی بریتانیایی است؛ mess around در انگلیسی آمریکایی هم بسیار رایج است. mess around with a device یعنی با دستگاه ور رفتن، نه لزوماً خراب‌کاری کردن.',
    example: 'Stop messing about and get ready.',
    register: 'خودمانی'
  },
  {
    id: 'youd-better',
    phrase: "You'd better + verb (گفتاری: You better + verb)",
    meaning: 'بهتره ...؛ بسته به لحن: حواست باشه که ...',
    explanation: "شکل معیار و رایج در نوشتار You'd better است؛ you'd اینجا کوتاه‌شده‌ی you had است و بعدش فعل ساده می‌آید، نه to + verb. در گفتار خودمانی گاهی had را می‌اندازند و می‌گویند You better. می‌تواند نصیحت جدی یا هشدار باشد؛ تهدید بودنش به لحن و موقعیت بستگی دارد. You'd better get out of here = «بهتره از اینجا بزنی به چاک.»",
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
    explanation: 'در این معنی چیزی به مورد قبلی اضافه می‌شود. مثال: «علاوه بر اجاره، قبض‌ها را هم باید بدهیم.» عبارت on top of the accounts به‌تنهایی مبهم است و برای ترجمه‌ی دقیق، جمله‌ی کامل لازم است.',
    example: 'On top of the rent, we have utility bills to pay.',
    register: 'معمولی'
  },
  {
    id: 'stay-on-top-of',
    phrase: 'be / stay on top of something',
    meaning: 'حواس‌جمع و مسلطِ کاری بودن؛ کارها را به‌روز و تحت کنترل نگه‌داشتن',
    explanation: 'با معنی «علاوه برِ» فرق دارد. stay on top of your accounts یعنی «حواست به حساب‌وکتاب‌هایت باشد و مرتب پیگیری‌شان کن».',
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
    explanation: 'either در پایان جمله‌ی منفی معمولاً معنی «هم» می‌دهد. خود این ساختار به‌تنهایی تهدید نیست؛ لحن تهدید از جمله و موقعیت می‌آید. اگر کسی فقط بگوید “Or your air, either!”, این تکه‌جمله است و بدون جمله‌ی قبل ترجمه‌ی قطعی ندارد.',
    example: "You won't get a warning—or a second chance, either.",
    register: 'گفتاری؛ وابسته به بافت'
  },
  {
    id: 'get-imperative',
    phrase: 'Get!',
    meaning: 'گمشو!؛ برو پی کارت!؛ بسته به موقعیت: بجنب و راه بیفت!',
    explanation: "اگر با لحن تند به کسی گفته شود، معمولاً یعنی «برو بیرون/گمشو». اگر منظور حرکت‌کردن باشد، می‌تواند «بجنب/راه بیفت» باشد. در You'd better get! معنی معمولاً «بهتره بزنی به چاک/راه بیفتی» است؛ get out کامل‌تر و روشن‌تر است.",
    example: 'The farmer shouted “Get!” at the stray dog.',
    register: 'امری و تند'
  }
];
