import type { OrderingTopic } from '../types/ordering';

export const ORDERING_TOPICS: OrderingTopic[] = [
  {
    id: 'weekend-activities',
    title: 'Weekend activities/ Sporty Day',
    titleVi: 'Hoạt động cuối tuần',
    category: 'Daily Life',
    hasFixedLead: false,
    keywordChain: [
      'Saturday morning',
      'Sixty men and women',
      'the prize',
      'football, jumping, and swimming',
      'food and drinks'
    ],
    rawKeywordsSummary: 'Saturday morning - Sixty men and women - the prize - football, jumping, and swimming - food and drinks',
    sentences: [
      {
        id: 'wa-1',
        originalIndex: 1,
        textEn: 'It started early on **Saturday morning** with a ten- mile race for adults.',
        textVi: 'Sự kiện được tổ chức vào sáng thứ Bảy, có cuộc đua 10 dặm dành cho người lớn.',
        keyword: 'Saturday morning'
      },
      {
        id: 'wa-2',
        originalIndex: 2,
        textEn: '**Sixty men and women** ran in this, and Ms Kamur won with a very fast time.',
        textVi: 'Có 60 người tham gia, trong đó cô Kamus là người chạy nhanh nhất và giành chiến thắng.',
        keyword: 'Sixty men and women'
      },
      {
        id: 'wa-3',
        originalIndex: 3,
        textEn: "After receiving **the prize,** the children's activities and competitions began.",
        textVi: 'Sau khi cô ấy nhận giải thưởng, thời gian tiếp theo là dành cho các hoạt động của trẻ em.',
        keyword: 'the prize'
      },
      {
        id: 'wa-4',
        originalIndex: 4,
        textEn: 'These activities included **football, jumping, and swimming**, and they had lots of fun.',
        textVi: 'Các hoạt động gồm đá bóng, bơi lội, nhảy dây... các em nhỏ chơi cùng nhau rất vui vẻ.',
        keyword: 'football, jumping, and swimming'
      },
      {
        id: 'wa-5',
        originalIndex: 5,
        textEn: 'They were all very hungry after all these, so they enjoyed tasty **food and drinks** with their parents.',
        textVi: 'Sau khi chơi xong, các em rất đói và ăn cùng với cha mẹ của mình.',
        keyword: 'food and drinks'
      }
    ]
  },
  {
    id: 'phim-anh',
    title: 'Phim ảnh (Films)',
    titleVi: 'Phim ảnh',
    category: 'Entertainment',
    hasFixedLead: false,
    keywordChain: [
      'period were different',
      'were black and white / sound',
      'technical limitations / low budget',
      'didn’t earn much',
      'earned millions of dollars'
    ],
    rawKeywordsSummary: 'period were different - were black and white / sound. - technical limitations / low budget. - didn’t earn much - earned millions of dollars',
    sentences: [
      {
        id: 'pa-1',
        originalIndex: 1,
        textEn: 'The films in that **period were different** from the films of today.',
        textVi: 'Những bộ phim cũ rất khác so với phim ngày nay.',
        keyword: 'period were different'
      },
      {
        id: 'pa-2',
        originalIndex: 2,
        textEn: 'This is because they **were black and white,** and there was no **sound**.',
        textVi: 'Đó là vì các bộ phim thời đó chỉ có màu đen trắng, và đôi khi còn không có âm thanh.',
        keyword: 'were black and white / sound'
      },
      {
        id: 'pa-3',
        originalIndex: 3,
        textEn: 'In addition to these **technical limitations**, film producers also had a very **low budget.**',
        textVi: 'Không chỉ có những hạn chế về công nghệ, mà các bộ phim còn có kinh phí thấp.',
        keyword: 'technical limitations / low budget'
      },
      {
        id: 'pa-4',
        originalIndex: 4,
        textEn: 'This lack of money mostly affected actors, and they **didn’t earn much.**',
        textVi: 'Do thiếu tiền, các diễn viên cũng có ít cơ hội kiếm tiền từ việc diễn xuất.',
        keyword: 'didn’t earn much'
      },
      {
        id: 'pa-5',
        originalIndex: 5,
        textEn: 'Things have changed over time, and some of them have **earned millions of dollars** after appearing in films.',
        textVi: 'Ngày nay mọi thứ đã thay đổi, diễn viên và nhà làm phim có thể kiếm được hàng triệu đô la từ việc sản xuất phim.',
        keyword: 'earned millions of dollars'
      }
    ]
  },
  {
    id: 'lich-su-di-lai',
    title: 'History of Transportation',
    titleVi: 'Lịch sử của việc đi lại',
    category: 'History & Society',
    hasFixedLead: false,
    keywordChain: [
      'to the rich',
      'The invention of cars and trains',
      'with airplanes',
      'flying with them is so fast',
      'improvement in transports'
    ],
    rawKeywordsSummary: 'to the rich - The invention of cars and trains - with airplanes - flying with them is so fast - improvement in transports',
    sentences: [
      {
        id: 'ls-1',
        originalIndex: 1,
        textEn: 'In the past, transportation was only available **to the rich**.',
        textVi: 'Trong quá khứ, phương tiện giao thông chỉ dành cho người giàu.',
        keyword: 'to the rich'
      },
      {
        id: 'ls-2',
        originalIndex: 2,
        textEn: '**The invention of cars and trains** had changed everything and made travelling cheaper.',
        textVi: 'Sự ra đời của ô tô và tàu hỏa đã thay đổi mọi thứ và khiến việc đi lại trở nên rẻ hơn.',
        keyword: 'The invention of cars and trains'
      },
      {
        id: 'ls-3',
        originalIndex: 3,
        textEn: 'After these two means of transport, travelling becomes even easier **with airplanes.**',
        textVi: 'Sau hai phương tiện này, việc đi lại còn trở nên dễ dàng hơn với máy bay.',
        keyword: 'with airplanes'
      },
      {
        id: 'ls-4',
        originalIndex: 4,
        textEn: 'Because **flying with them is so fast**, more people now go abroad for holiday and business.',
        textVi: 'Vì máy bay rất nhanh, nên ngày nay nhiều người đi nước ngoài để du lịch và công tác hơn.',
        keyword: 'flying with them is so fast'
      },
      {
        id: 'ls-5',
        originalIndex: 5,
        textEn: 'It is more convenient to travel to other part of the world due to the **improvement in transports.**',
        textVi: 'Việc di chuyển đến các khu vực khác trên thế giới trở nên thuận tiện hơn nhờ sự phát triển của giao thông vận tải.',
        keyword: 'improvement in transports'
      }
    ]
  },
  {
    id: 'new-cafe-in-town',
    title: 'New Café in Town',
    titleVi: 'Quán cafe mới',
    category: 'Daily Life',
    hasFixedLead: true,
    keywordChain: [
      'full of people',
      'found me a nice table',
      'I first looked at the menu',
      'choose the most expensive sandwich',
      'would definitely go back to this place'
    ],
    rawKeywordsSummary: 'full of people - found me a nice table - I first looked at the menu - choose the most expensive sandwich - would definitely go back to this place',
    sentences: [
      {
        id: 'nc-1',
        originalIndex: 1,
        textEn: 'Last week I went to a new opening cafe on Corner Street.',
        textVi: 'Tuần trước tôi đã đến một quán cà phê mới mở trên phố Corner.',
        isFixed: true
      },
      {
        id: 'nc-2',
        originalIndex: 2,
        textEn: 'It was **full of people,** and the staff were working hard on their first day.',
        textVi: 'Ở đó rất nhiều người, nhân viên thì làm việc chăm chỉ trong ngày đầu tiên.',
        keyword: 'full of people'
      },
      {
        id: 'nc-3',
        originalIndex: 3,
        textEn: 'Despite the crowd, they **found me a nice table** and brought me a menu.',
        textVi: 'Mặc dù rất đông nhưng nhân viên vẫn xếp cho tôi một bàn đẹp và mang thực đơn tới.',
        keyword: 'found me a nice table'
      },
      {
        id: 'nc-4',
        originalIndex: 4,
        textEn: 'When **I first looked at the menu,** I was disappointed since I hoped to see a variety of dishes.',
        textVi: 'Khi tôi xem thực đơn, tôi thấy thất vọng vì tôi mong có nhiều món đa dạng hơn.',
        keyword: 'I first looked at the menu'
      },
      {
        id: 'nc-5',
        originalIndex: 5,
        textEn: 'I had to choose one of those, so I decided to **choose the most expensive sandwich.**',
        textVi: 'Tôi buộc phải chọn một món trong đó, vì vậy tôi đã gọi món sandwich đắt nhất.',
        keyword: 'choose the most expensive sandwich'
      },
      {
        id: 'nc-6',
        originalIndex: 6,
        textEn: 'It was really good with cheese topping, and I **would definitely go back to this place.**',
        textVi: 'Nó có vị khá ngon với lớp phủ phô mai, và tôi chắc chắn sẽ quay lại chỗ này.',
        keyword: 'would definitely go back to this place'
      }
    ]
  },
  {
    id: 'writing-about-a-place',
    title: 'Writing about a place / Homework next week',
    titleVi: 'Viết về một địa điểm',
    category: 'Education & Studies',
    hasFixedLead: false,
    keywordChain: [
      'Before starting writing',
      'people, language, and history',
      'you will also compare',
      'understand the similarities',
      'some common areas'
    ],
    rawKeywordsSummary: 'Before starting writing - people, language, and history - you will also compare - understand the similarities - some common areas',
    sentences: [
      {
        id: 'wp-1',
        originalIndex: 1,
        textEn: '**Before starting writing,** you should do research on many details of that place.',
        textVi: 'Trước khi bắt đầu viết, bạn cần nghiên cứu và tìm hiểu thêm chi tiết về địa điểm đó.',
        keyword: 'Before starting writing'
      },
      {
        id: 'wp-2',
        originalIndex: 2,
        textEn: 'These must include data on its **people, language, and history.**',
        textVi: 'Bài viết phải bao gồm các thông tin như con người, ngôn ngữ và lịch sử.',
        keyword: 'people, language, and history'
      },
      {
        id: 'wp-3',
        originalIndex: 3,
        textEn: 'While giving information about three areas, **you will also compare** it with your own country.',
        textVi: 'Khi cung cấp thông tin về 3 lĩnh vực này, bạn cũng sẽ so sánh chúng với đất nước của bạn.',
        keyword: 'you will also compare'
      },
      {
        id: 'wp-4',
        originalIndex: 4,
        textEn: 'This comparison will **understand the similarities** between the two countries.',
        textVi: 'Sự so sánh này có thể giúp bạn tìm ra những điểm tương đồng giữa hai quốc gia.',
        keyword: 'understand the similarities'
      },
      {
        id: 'wp-5',
        originalIndex: 5,
        textEn: 'There may not be many of those, but still you will see **some common areas.**',
        textVi: 'Có thể không thấy nhiều điểm tương đồng nhưng chắc chắn bạn sẽ nhận thấy một số điểm chung.',
        keyword: 'some common areas'
      }
    ]
  },
  {
    id: 'jade-nobelston',
    title: 'A famous singer Jade Nobelston',
    titleVi: 'Ca sĩ nổi tiếng Jade Nobelston',
    category: 'People & Celebrities',
    hasFixedLead: true,
    keywordChain: [
      'Before becoming famous',
      'he started to perform on stage',
      'likes to wear colorful clothes',
      'attracted people’s attention',
      'he is now very famous'
    ],
    rawKeywordsSummary: 'Before becoming famous - he started to perform on stage - likes to wear colorful clothes - attracted people’s attention - he is now very famous',
    sentences: [
      {
        id: 'jn-1',
        originalIndex: 1,
        textEn: 'Jade Nobelston is a famous stage singer and performer.',
        textVi: 'Jade Nobelston là một ca sĩ và nghệ sĩ biểu diễn sân khấu nổi tiếng.',
        isFixed: true
      },
      {
        id: 'jn-2',
        originalIndex: 2,
        textEn: '**Before becoming famous** at a young age, he studied art and music at high school.',
        textVi: 'Trước khi trở nên nổi tiếng khi còn trẻ, anh ấy đã học nghệ thuật và âm nhạc ở trường phổ thông.',
        keyword: 'Before becoming famous'
      },
      {
        id: 'jn-3',
        originalIndex: 3,
        textEn: 'During this education, **he started to perform on stage.**',
        textVi: 'Trong quá trình học tập, anh ấy bắt đầu biểu diễn trên sân khấu.',
        keyword: 'he started to perform on stage'
      },
      {
        id: 'jn-4',
        originalIndex: 4,
        textEn: 'During his performances on stage, he **likes to wear colorful clothes** and paint his face.',
        textVi: 'Khi biểu diễn trên sân khấu, anh ấy thích mặc những bộ đồ sặc sỡ và vẽ mặt.',
        keyword: 'likes to wear colorful clothes'
      },
      {
        id: 'jn-5',
        originalIndex: 5,
        textEn: 'This strange ways of dressing and his songs **attracted people’s attention.**',
        textVi: 'Phong cách ăn mặc khác biệt và các bài hát của anh ấy đã thu hút sự chú ý của mọi người.',
        keyword: 'attracted people’s attention'
      },
      {
        id: 'jn-6',
        originalIndex: 6,
        textEn: 'They started to follow him on social media and **he is now very famous.**',
        textVi: 'Họ bắt đầu theo dõi anh ấy trên mạng xã hội và giờ đây anh ấy rất nổi tiếng.',
        keyword: 'he is now very famous'
      }
    ]
  },
  {
    id: 'university-welcome-day',
    title: 'University Welcome Day',
    titleVi: 'Ngày chào đón tân sinh viên',
    category: 'Education & Studies',
    hasFixedLead: true,
    keywordChain: [
      'begin at 10 a.m',
      'At the end of this talk',
      'These staff members',
      'until lunch break',
      'on the second floor of the engineering building'
    ],
    rawKeywordsSummary: 'begin at 10 a.m - At the end of this talk - These staff members - until lunch break - on the second floor of the engineering building',
    sentences: [
      {
        id: 'uwd-1',
        originalIndex: 1,
        textEn: 'All students will attend the welcoming day on Monday, the 19th.',
        textVi: 'Tất cả sinh viên sẽ tham dự ngày chào đón vào thứ Hai, ngày 19.',
        isFixed: true
      },
      {
        id: 'uwd-2',
        originalIndex: 2,
        textEn: 'The day will **begin at 10 a.m** in the morning with a short presentation.',
        textVi: 'Chương trình sẽ bắt đầu lúc 10 giờ sáng với một bài thuyết trình ngắn.',
        keyword: 'begin at 10 a.m'
      },
      {
        id: 'uwd-3',
        originalIndex: 3,
        textEn: '**At the end of this talk**, you will meet the heads of departments and teachers.',
        textVi: 'Cuối bài nói chuyện này, các bạn sẽ gặp gỡ các trưởng khoa và thầy cô giáo.',
        keyword: 'At the end of this talk'
      },
      {
        id: 'uwd-4',
        originalIndex: 4,
        textEn: 'These staff members will give you a guided tour in the buildings and our sport facilities in small groups.',
        textVi: 'Các nhân viên này sẽ dẫn các bạn đi tham quan các tòa nhà và khu thể thao theo từng nhóm nhỏ.',
        keyword: 'These staff members'
      },
      {
        id: 'uwd-5',
        originalIndex: 5,
        textEn: 'During this visit, you will need to stay with these students **until lunch break.**',
        textVi: 'Trong buổi tham quan này, các bạn cần đi cùng nhóm sinh viên này cho đến giờ ăn trưa.',
        keyword: 'until lunch break'
      },
      {
        id: 'uwd-6',
        originalIndex: 6,
        textEn: 'This meal will be provided **on the second floor of the engineering building.**',
        textVi: 'Bữa ăn này sẽ được phục vụ tại tầng hai của tòa nhà kỹ thuật.',
        keyword: 'on the second floor of the engineering building'
      }
    ]
  },
  {
    id: 'music-festivals',
    title: 'Music festivals',
    titleVi: 'Lễ hội âm nhạc',
    category: 'Entertainment',
    hasFixedLead: true,
    keywordChain: [
      'The local authority',
      'it was free',
      'arrived early',
      'The staff there had a busy day',
      'He performed for two hours'
    ],
    rawKeywordsSummary: 'The local authority - it was free - arrived early - The staff there had a busy day - He performed for two hours',
    sentences: [
      {
        id: 'mf-1',
        originalIndex: 1,
        textEn: 'Last Saturday, a live music show was held in town park.',
        textVi: 'Thứ Bảy tuần trước, một buổi biểu diễn ca nhạc trực tiếp đã diễn ra tại công viên thị trấn.',
        isFixed: true
      },
      {
        id: 'mf-2',
        originalIndex: 2,
        textEn: '**The local authority** planned, sponsored, and paid for everything.',
        textVi: 'Chính quyền địa phương đã lên kế hoạch, tài trợ và chi trả cho tất cả mọi thứ.',
        keyword: 'The local authority'
      },
      {
        id: 'mf-3',
        originalIndex: 3,
        textEn: 'Because **it was free**, more than 5,000 people attended.',
        textVi: 'Vì sự kiện hoàn toàn miễn phí, hơn 5.000 người đã tới tham dự.',
        keyword: 'it was free'
      },
      {
        id: 'mf-4',
        originalIndex: 4,
        textEn: 'Many of them **arrived early** and visited nearby shops while they were waiting for it to begin.',
        textVi: 'Nhiều người trong số họ đã đến sớm và ghé các cửa hàng gần đó trong khi chờ chương trình bắt đầu.',
        keyword: 'arrived early'
      },
      {
        id: 'mf-5',
        originalIndex: 5,
        textEn: '**The staff there had a busy day,** but they were able to close early and watch the famous singer perform.',
        textVi: 'Nhân viên ở đó đã có một ngày bận rộn, nhưng họ vẫn kịp đóng cửa sớm để xem ca sĩ nổi tiếng biểu diễn.',
        keyword: 'The staff there had a busy day'
      },
      {
        id: 'mf-6',
        originalIndex: 6,
        textEn: '**He performed for two hours** and everyone had great fun.',
        textVi: 'Anh ấy đã biểu diễn trong hai giờ đồng hồ và mọi người đều rất hào hứng.',
        keyword: 'He performed for two hours'
      }
    ]
  },
  {
    id: 'first-woman-in-space',
    title: 'The first American woman in space',
    titleVi: 'Người phụ nữ Mỹ đầu tiên bay vào vũ trụ',
    category: 'Science & History',
    hasFixedLead: true,
    keywordChain: [
      'With the support from parents',
      'training course',
      'of a research team',
      'did a lot of experiments',
      'growing plants and some animals'
    ],
    rawKeywordsSummary: 'With the support from parents - training course - of a research team - did a lot of experiments - growing plants and some animals',
    sentences: [
      {
        id: 'fws-1',
        originalIndex: 1,
        textEn: 'Her father was a skilled worker and her mother was a teacher.',
        textVi: 'Cha của cô là một công nhân lành nghề và mẹ cô là một giáo viên.',
        isFixed: true
      },
      {
        id: 'fws-2',
        originalIndex: 2,
        textEn: '**With the support from parents**, Mae went to university to study Science.',
        textVi: 'Với sự ủng hộ từ cha mẹ, Mae đã vào đại học để học ngành Khoa học.',
        keyword: 'With the support from parents'
      },
      {
        id: 'fws-3',
        originalIndex: 3,
        textEn: 'Her degree allows her to get a seat on the **training course** in the USA.',
        textVi: 'Bằng tốt nghiệp đại học đã giúp cô giành được một vị trí trong khóa huấn luyện tại Hoa Kỳ.',
        keyword: 'training course'
      },
      {
        id: 'fws-4',
        originalIndex: 4,
        textEn: 'This is about space and it helps her to become a member **of a research team.**',
        textVi: 'Khóa học này liên quan đến không gian và giúp cô trở thành thành viên của một nhóm nghiên cứu.',
        keyword: 'of a research team'
      },
      {
        id: 'fws-5',
        originalIndex: 5,
        textEn: 'As a part of this group, she traveled in space and **did a lot of experiments** there.',
        textVi: 'Là một thành viên của nhóm này, cô đã bay vào không gian và thực hiện rất nhiều thí nghiệm tại đó.',
        keyword: 'did a lot of experiments'
      },
      {
        id: 'fws-6',
        originalIndex: 6,
        textEn: 'Some of those were about **growing plants and some animals** in a spaceship.',
        textVi: 'Một số thí nghiệm trong số đó liên quan đến việc trồng cây và nuôi động vật trong tàu vũ trụ.',
        keyword: 'growing plants and some animals'
      }
    ]
  },
  {
    id: 'end-of-term-project',
    title: 'End of term project',
    titleVi: 'Bài tập cuối kỳ',
    category: 'Education & Studies',
    hasFixedLead: true,
    keywordChain: [
      'choose at least 2 of these',
      'relevant images and your own text',
      'create a presentation',
      'minutes to talk',
      'ask questions and you need to answer them'
    ],
    rawKeywordsSummary: 'choose at least 2 of these - relevant images and your own text - create a presentation - minutes to talk - ask questions and you need to answer them',
    sentences: [
      {
        id: 'etp-1',
        originalIndex: 1,
        textEn: 'This semester we have studied several chapters about local history in the class.',
        textVi: 'Học kỳ này chúng ta đã cùng tìm hiểu một số chương về lịch sử địa phương trên lớp.',
        isFixed: true
      },
      {
        id: 'etp-2',
        originalIndex: 2,
        textEn: 'For end of term project, you need to **choose at least 2 of these.**',
        textVi: 'Đối với bài tập cuối kỳ, các bạn cần chọn ít nhất 2 trong số những phần này.',
        keyword: 'choose at least 2 of these'
      },
      {
        id: 'etp-3',
        originalIndex: 3,
        textEn: 'It needs to include **relevant images and your own text** about the topic.',
        textVi: 'Bài làm cần có các hình ảnh liên quan và bài viết do chính bạn soạn thảo về chủ đề đó.',
        keyword: 'relevant images and your own text'
      },
      {
        id: 'etp-4',
        originalIndex: 4,
        textEn: 'Then you need to use images and written work to **create a presentation.**',
        textVi: 'Sau đó, bạn cần sử dụng hình ảnh và bài viết đó để tạo thành một bài thuyết trình.',
        keyword: 'create a presentation'
      },
      {
        id: 'etp-5',
        originalIndex: 5,
        textEn: 'Your presentation offer your key points and you have around 5 **minutes to talk.**',
        textVi: 'Bài thuyết trình của bạn cần nêu bật các ý chính và bạn có khoảng 5 phút để trình bày.',
        keyword: 'minutes to talk'
      },
      {
        id: 'etp-6',
        originalIndex: 6,
        textEn: 'After this time, other students are able to **ask questions and you need to answer them.**',
        textVi: 'Sau thời gian đó, các bạn học khác có thể đặt câu hỏi và bạn cần trả lời chúng.',
        keyword: 'ask questions and you need to answer them'
      }
    ]
  }
];
