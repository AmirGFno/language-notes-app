/*
 * نکته‌های آموزشیِ بازنویسی‌شده.
 * متن فارسی و مثال‌های انگلیسی جدا نگهداری می‌شوند تا جهت نوشتار به‌هم نریزد.
 */
window.REPOSITORY_NOTES = [
  {
    id: 'separable-phrasal-verbs-pronouns',
    title: 'جای ضمیر در فعل‌های عبارتیِ جداپذیر',
    intro: 'در بعضی فعل‌های عبارتیِ جداپذیر، جای مفعول می‌تواند عوض شود. اگر مفعول ضمیر باشد، جای آن قانون مشخصی دارد.',
    sections: [
      {
        title: 'وقتی مفعول ضمیر است',
        text: 'در فعل عبارتیِ جداپذیر، ضمیر مفعولی را میان فعل و بخش دوم می‌گذاریم.',
        examples: [
          { english: 'Pick them up.', persian: 'آن‌ها را بردار.', correct: true },
          { english: "Pick 'em up.", persian: 'این هم شکل کوتاه و خودمانیِ همان جمله است.', correct: true },
          { english: 'Pick up them.', persian: 'در فعل جداپذیر، ضمیر را در این جایگاه نمی‌گذاریم.', correct: false }
        ]
      },
      {
        title: 'وقتی مفعول اسم است',
        text: 'اسمِ مفعول می‌تواند میان دو بخش فعل یا پس از بخش دوم بیاید؛ هر دو چینش درست‌اند.',
        examples: [
          { english: 'Pick the keys up.', persian: 'کلیدها را بردار.', correct: true },
          { english: 'Pick up the keys.', persian: 'همان معنی: کلیدها را بردار.', correct: true }
        ]
      },
      {
        title: 'فعل‌های جدانشدنی',
        text: 'این قاعده به همه‌ی فعل‌های عبارتی تعمیم پیدا نمی‌کند. در فعل جدانشدنی، بخش‌های فعل کنار هم می‌مانند.',
        examples: [
          { english: 'Look after them.', persian: 'مراقب آن‌ها باش.', correct: true },
          { english: 'Look them after.', persian: 'نادرست: مفعول را نمی‌توان میان بخش‌های این فعل گذاشت.', correct: false }
        ]
      }
    ],
    takeaway: 'جمع‌بندی: در فعل جداپذیر، ضمیر مفعولی میان دو بخش می‌آید؛ در فعل جدانشدنی، فعل را از هم جدا نمی‌کنیم.'
  },
  {
    id: 'your-vs-yours',
    title: 'تفاوت صفت ملکی و ضمیر ملکی',
    intro: 'هر دو برای نشان‌دادن مالکیت به کار می‌روند، اما جایگاهشان در جمله فرق دارد: یکی همراه اسم می‌آید و دیگری به‌تنهایی جای عبارت ملکی را می‌گیرد.',
    sections: [
      {
        title: 'صفت ملکی همراه اسم',
        text: 'پس از صفت ملکی باید اسم بیاید؛ این ساختار نشان می‌دهد چیزی به مخاطب تعلق دارد.',
        examples: [
          { english: 'This is your pen.', persian: 'این خودکارِ توست.', correct: true }
        ]
      },
      {
        title: 'ضمیر ملکی به‌تنهایی',
        text: 'ضمیر ملکی می‌تواند جای ترکیبِ صفت ملکی و اسم را بگیرد؛ پس از آن اسم تکرار نمی‌شود.',
        examples: [
          { english: 'This pen is yours.', persian: 'این خودکار مال توست.', correct: true },
          { english: 'Is this pen yours?', persian: 'آیا این خودکار مال توست؟', correct: true }
        ]
      },
      {
        title: 'تشخیص اشتباه رایج',
        text: 'برای پرسیدن درباره‌ی مالکیت، می‌توانی یکی از دو ساختار درست زیر را به‌کار ببری؛ در شکل نادرست، صفت ملکی بدون اسم آمده است.',
        examples: [
          { english: 'Is this your pen?', persian: 'درست: آیا این خودکار مال توست؟', correct: true },
          { english: 'Is this pen yours?', persian: 'درست: آیا این خودکار مال توست؟', correct: true },
          { english: 'Is this pen your?', persian: 'نادرست: پس از صفت ملکی باید اسم بیاید.', correct: false }
        ]
      }
    ],
    takeaway: 'یادت بماند: صفت ملکی همیشه پیش از اسم می‌آید؛ ضمیر ملکی می‌تواند به‌تنهایی بیاید.'
  }
];
