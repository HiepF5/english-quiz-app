import type { OpinionTopic } from '../types/opinion';

export const OPINION_TOPICS: OpinionTopic[] = [
  {
    "id": "topic-1",
    "topicNumber": 1,
    "title": "The Music Festival",
    "titleVi": "Lễ hội âm nhạc (The Music Festival)",
    "category": "Aptis Reading Part 4",
    "people": [
      "James",
      "Lisa",
      "Robert",
      "Christina"
    ],
    "paragraphs": [
      {
        "personIndex": 0,
        "personName": "James",
        "contentEn": "This is my first time going to a concert, and the experience was quite mixed. During the first two days. The music was rather ordinary, and the event would have been far more enjoyable if there had been just a little sunshine to brighten things up. Luckily, the last day completely changed my impression, as I finally got to see my favorite singers. Meeting them and enjoying the performances made the whole trip memorable and truly special.",
        "contentVi": "Đây là lần đầu tiên tôi đi xem hòa nhạc, và trải nghiệm này khá là lẫn lộn. Trong hai ngày đầu, âm nhạc khá bình thường, và sự kiện chắc chắn sẽ thú vị hơn nhiều nếu có một chút nắng để làm mọi thứ tươi sáng hơn. May mắn thay, ngày cuối cùng đã hoàn toàn thay đổi ấn tượng của tôi, vì tôi cuối cùng cũng được gặp những ca sĩ yêu thích của mình. Gặp họ và thưởng thức những màn trình diễn đã khiến cả chuyến đi trở nên đáng nhớ và thật đặc biệt."
      },
      {
        "personIndex": 1,
        "personName": "Lisa",
        "contentEn": "I attend music festivals every year, and over time it has become something of a personal tradition. I really enjoy the energetic atmosphere where people come together to share music and excitement. This particular festival, however, felt quite different from what I am used to. The weather conditions were less than perfect, though it didn’t bother me that much, as I have enjoyed festivals in the rain before. The venue was moderately convenient and the performances themselves were rather unremarkable. To be honest, I doubt I will choose to come back in the future.",
        "contentVi": "Tôi tham dự các lễ hội âm nhạc hằng năm, và theo thời gian, điều đó đã trở thành một thói quen cá nhân của tôi. Tôi thực sự thích bầu không khí sôi động, nơi mọi người cùng nhau chia sẻ âm nhạc và sự hào hứng. Tuy nhiên, lễ hội lần này cảm thấy khá khác so với những gì tôi quen thuộc. Thời tiết không mấy thuận lợi, nhưng điều đó cũng không khiến tôi bận tâm lắm, vì tôi từng tận hưởng những lễ hội dưới mưa trước đây. Địa điểm tổ chức ở mức tạm được và các màn biểu diễn thì khá bình thường. Thành thật mà nói, tôi nghi ngờ về lựa chọn quay lại trong tương lai."
      },
      {
        "personIndex": 2,
        "personName": "Robert",
        "contentEn": "I don’t like one particular kinds of music being played at festivals, as I much prefer a variety of genres to enjoy and dance to. Luckily, this event truly lived up to what I was hoping for. The songs and melodies were absolutely impressive, leaving a strong impression on me. Although there was some rain, I actually felt it made the atmosphere even more vibrant and fun. One drawback, however, the cost was quite high, which many students, including me, found difficult to afford. Organizers should reconsider the price more carefully.",
        "contentVi": "Tôi không thích khi tại các lễ hội chỉ phát một thể loại nhạc duy nhất, vì tôi thích có sự đa dạng về thể loại để thưởng thức và nhảy theo hơn. May mắn thay, sự kiện lần này thực sự đáp ứng đúng mong đợi của tôi. Những bài hát và giai điệu thật sự ấn tượng, để lại trong tôi một ấn tượng sâu sắc. Mặc dù có một chút mưa, nhưng tôi cảm thấy điều đó khiến bầu không khí càng thêm sôi động và vui vẻ. Tuy nhiên, một điểm trừ là giá vé khá cao, khiến nhiều sinh viên, bao gồm cả tôi, cảm thấy khó có thể chi trả. Ban tổ chức nên cân nhắc lại mức giá cẩn thận hơn."
      },
      {
        "personIndex": 3,
        "personName": "Christina",
        "contentEn": "My band and I went to the music festival, and we delivered the kind of performance our audience has come to expect from us. The show turned out to be truly memorable, not only because of the energy on stage but also because some of our ex-band members were present. It felt great to reconnect with them and share stories after the performance. The atmosphere overall was very positive, and the crowd seemed to enjoy every moment. The only real challenge was that the venue was located quite far from the main road, which made moving our instruments and equipment rather inconvenient.",
        "contentVi": "Ban nhạc của tôi và tôi đã đến lễ hội âm nhạc, và chúng tôi đã mang đến màn trình diễn đúng như những gì khán giả mong đợi ở chúng tôi. Buổi biểu diễn thật sự đáng nhớ, không chỉ vì năng lượng trên sân khấu mà còn vì một số thành viên cũ của ban nhạc cũng có mặt. Thật tuyệt khi được kết nối lại với họ và cùng nhau chia sẻ những câu chuyện sau buổi biểu diễn. Bầu không khí nhìn chung rất tích cực, và khán giả dường như đã tận hưởng từng khoảnh khắc. Thử thách thực sự duy nhất là địa điểm tổ chức nằm khá xa đường chính, khiến việc di chuyển nhạc cụ và thiết bị trở nên khá bất tiện."
      }
    ],
    "questions": [
      {
        "id": 1,
        "questionNumber": 1,
        "question": "Who was not impressed by the event overall?",
        "correctPersonIndex": 1,
        "explanation": "Đáp án đúng: Lisa\n\n📌 Dẫn chứng trích đoạn:\n\"the performances themselves were rather unremarkable. To be honest, I doubt I will choose to come back in the future.\"\n-> Dịch: \"các màn biểu diễn thì khá bình thường. Thành thật mà nói, tôi nghi ngờ về lựa chọn quay lại trong tương lai.\"\n\n💡 Mẹo ghi nhớ cho Lisa:\nTham gia lễ hội hàng năm (I attend music festival) -> Không ấn tượng với toàn bộ sự kiện (not impressed / unremarkable / doubt come back).",
        "mnemonicHint": "Tham gia lễ hội hàng năm (I attend music festival) -> Không ấn tượng với toàn bộ sự kiện (not impressed / unremarkable / doubt come back)."
      },
      {
        "id": 2,
        "questionNumber": 2,
        "question": "Who thought the event was expensive?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Robert\n\n📌 Dẫn chứng trích đoạn:\n\"One drawback, however, the cost was quite high, which many students, including me, found difficult to afford.\"\n-> Dịch: \"Một điểm trừ là giá vé khá cao, khiến nhiều sinh viên, bao gồm cả tôi, cảm thấy khó có thể chi trả.\"\n\n💡 Mẹo ghi nhớ cho Robert:\nKhông thích chỉ nghe một thể loại mà thích đa dạng/tất cả (all the music / variety of genres) -> Thấy sự kiện đắt đỏ, khó kham nổi (expensive / high cost / difficult to afford).",
        "mnemonicHint": "Không thích chỉ nghe một thể loại mà thích đa dạng/tất cả (all the music / variety of genres) -> Thấy sự kiện đắt đỏ, khó kham nổi (expensive / high cost / difficult to afford)."
      },
      {
        "id": 3,
        "questionNumber": 3,
        "question": "Who is disappointed with the weather?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: James\n\n📌 Dẫn chứng trích đoạn:\n\"the event would have been far more enjoyable if there had been just a little sunshine to brighten things up.\"\n-> Dịch: \"sự kiện chắc chắn sẽ thú vị hơn nhiều nếu có một chút nắng để làm mọi thứ tươi sáng hơn.\"\n\n💡 Mẹo ghi nhớ cho James:\nLần đầu đi xem nhạc (This is my first time) -> Thất vọng về thời tiết (weather / a little sunshine) -> Bù lại thích ngày cuối cùng (last day / final day).",
        "mnemonicHint": "Lần đầu đi xem nhạc (This is my first time) -> Thất vọng về thời tiết (weather / a little sunshine) -> Bù lại thích ngày cuối cùng (last day / final day)."
      },
      {
        "id": 4,
        "questionNumber": 4,
        "question": "Who likes meeting old friends?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Christina\n\n📌 Dẫn chứng trích đoạn:\n\"some of our ex-band members were present. It felt great to reconnect with them and share stories after the performance.\"\n-> Dịch: \"một số thành viên cũ của ban nhạc cũng có mặt. Thật tuyệt khi được kết nối lại với họ và cùng nhau chia sẻ những câu chuyện sau buổi biểu diễn.\"\n\n💡 Mẹo ghi nhớ cho Christina:\nBan nhạc (My band) -> Gặp lại cựu thành viên/bạn cũ (ex-band members / old friends) -> Địa điểm xa, không tốt (location / venue far / not good).",
        "mnemonicHint": "Ban nhạc (My band) -> Gặp lại cựu thành viên/bạn cũ (ex-band members / old friends) -> Địa điểm xa, không tốt (location / venue far / not good)."
      },
      {
        "id": 5,
        "questionNumber": 5,
        "question": "Who enjoyed the final day of the music event?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: James\n\n📌 Dẫn chứng trích đoạn:\n\"Luckily, the last day completely changed my impression, as I finally got to see my favorite singers. Meeting them and enjoying the performances made the whole trip memorable and truly special.\"\n-> Dịch: \"May mắn thay, ngày cuối cùng đã hoàn toàn thay đổi ấn tượng của tôi, vì tôi cuối cùng cũng được gặp những ca sĩ yêu thích của mình. Gặp họ và thưởng thức những màn trình diễn đã khiến cả chuyến đi trở nên đáng nhớ và thật đặc biệt.\"\n\n💡 Mẹo ghi nhớ cho James:\nLần đầu đi xem nhạc (This is my first time) -> Thất vọng về thời tiết (weather / a little sunshine) -> Bù lại thích ngày cuối cùng (last day / final day).",
        "mnemonicHint": "Lần đầu đi xem nhạc (This is my first time) -> Thất vọng về thời tiết (weather / a little sunshine) -> Bù lại thích ngày cuối cùng (last day / final day)."
      },
      {
        "id": 6,
        "questionNumber": 6,
        "question": "Who thought the location was not good?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Christina\n\n📌 Dẫn chứng trích đoạn:\n\"The only real challenge was that the venue was located quite far from the main road, which made moving our instruments and equipment rather inconvenient.\"\n-> Dịch: \"Thử thách thực sự duy nhất là địa điểm tổ chức nằm khá xa đường chính, khiến việc di chuyển nhạc cụ và thiết bị trở nên khá bất tiện.\"\n\n💡 Mẹo ghi nhớ cho Christina:\nBan nhạc (My band) -> Gặp lại cựu thành viên/bạn cũ (ex-band members / old friends) -> Địa điểm xa, không tốt (location / venue far / not good).",
        "mnemonicHint": "Ban nhạc (My band) -> Gặp lại cựu thành viên/bạn cũ (ex-band members / old friends) -> Địa điểm xa, không tốt (location / venue far / not good)."
      },
      {
        "id": 7,
        "questionNumber": 7,
        "question": "Who enjoyed all the music at the music event?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Robert\n\n📌 Dẫn chứng trích đoạn:\n\"I don’t like one particular kinds of music being played at festivals, as I much prefer a variety of genres to enjoy and dance to. Luckily, this event truly lived up to what I was hoping for. The songs and melodies were absolutely impressive...\"\n-> Dịch: \"Tôi không thích khi tại các lễ hội chỉ phát một thể loại nhạc duy nhất, vì tôi thích có sự đa dạng về thể loại để thưởng thức và nhảy theo hơn. May mắn thay, sự kiện lần này thực sự đáp ứng đúng mong đợi của tôi. Những bài hát và giai điệu thật sự ấn tượng...\"\n\n💡 Mẹo ghi nhớ cho Robert:\nKhông thích chỉ nghe một thể loại mà thích đa dạng/tất cả (all the music / variety of genres) -> Thấy sự kiện đắt đỏ, khó kham nổi (expensive / high cost / difficult to afford).",
        "mnemonicHint": "Không thích chỉ nghe một thể loại mà thích đa dạng/tất cả (all the music / variety of genres) -> Thấy sự kiện đắt đỏ, khó kham nổi (expensive / high cost / difficult to afford)."
      }
    ]
  },
  {
    "id": "topic-2",
    "topicNumber": 2,
    "title": "Extreme sports",
    "titleVi": "Thể thao mạo hiểm (Extreme sports)",
    "category": "Aptis Reading Part 4",
    "people": [
      "Jose",
      "Marisol",
      "Sira",
      "Bao"
    ],
    "paragraphs": [
      {
        "personIndex": 0,
        "personName": "Jose",
        "contentEn": "I don’t usually like sports, but once I tried sea diving at the invitation of my friends. I fell in love with this sport ever since my first attempt. Extreme sports can be very dangerous; therefore, before I decided to take it up as a hobby, I made sure that I fully understood all the guidance from my expert trainers, who have years of experience. This helped me improve myself and feel more confident.",
        "contentVi": "Tôi vốn không hay chơi thể thao, nhưng có lần tôi đã thử đi lặn biển theo lời rủ của bạn bè. Tôi đã mê môn này ngay từ lần thử đầu tiên. Thể thao mạo hiểm có thể rất nguy hiểm; vì vậy, trước khi quyết định chọn nó làm sở thích, tôi đảm bảo rằng mình đã nắm rất rõ mọi hướng dẫn từ các huấn luyện viên chuyên nghiệp nhiều năm kinh nghiệm. Điều này giúp tôi tiến bộ và cảm thấy tự tin hơn."
      },
      {
        "personIndex": 1,
        "personName": "Marisol",
        "contentEn": "Some people like jumping out of aeroplanes or exploring the sea. I’m a pilot, and I have never understood why people would throw themselves into such danger. I once tried an extreme sport and realised I was right from the beginning. My job is already overwhelming and involves enough risky activities. Now, I prefer something more casual, such as baseball or volleyball.",
        "contentVi": "Nhiều người thích nhảy ra khỏi máy bay hoặc khám phá biển sâu. Tôi là một phi công, và tôi chưa bao giờ hiểu nổi tại sao người ta lại lao mình vào những mối nguy hiểm như vậy. Tôi từng thử một môn thể thao mạo hiểm và nhận ra mình đã đúng ngay từ đầu. Công việc của tôi vốn đã quá áp lực và có thừa các hoạt động rủi ro rồi. Giờ đây, tôi thích những môn thể thao nhẹ nhàng, phổ thông hơn như bóng chày hay bóng chuyền."
      },
      {
        "personIndex": 2,
        "personName": "Sira",
        "contentEn": "Doing free-diving requires a lot of patience and effort to become proficient. I live far away from the sea, so it is even more difficult for me. I can only do it a few times a year, which is never enough to satisfy my passion. Once I am in the water, I feel at home. I am surrounded by various types of fish and can almost touch them.",
        "contentVi": "Môn lặn tự do đòi hỏi rất nhiều kiên nhẫn và nỗ lực để trở nên thành thạo. Tôi sống xa biển nên việc đó lại càng khó khăn hơn. Tôi chỉ có thể đi lặn vài lần mỗi năm, và chừng đó không bao giờ là đủ để thỏa mãn niềm đam mê của tôi. Mỗi khi ở dưới nước, tôi cảm giác thoải mái như đang ở nhà. Tôi được bao quanh bởi đủ loại cá và gần như có thể chạm tay vào chúng."
      },
      {
        "personIndex": 3,
        "personName": "Bao",
        "contentEn": "As a child, I used to play sports because they were part of our school curriculum. I mean, whose school isn’t? However, I have never enjoyed those activities. Some students are naturally gifted, as they have strong physiques and are able to endure long running sessions; however, not everyone is the same. For me, these lessons were rather a waste of time, as I preferred staying indoors and reading books.",
        "contentVi": "Hồi bé, tôi từng phải chơi thể thao vì môn đó nằm trong chương trình học ở trường. Ý tôi là trường nào chẳng thế? Tuy vậy, tôi chưa từng thích những hoạt động đó. Một số học sinh bẩm sinh đã có năng khiếu vì thể lực tốt và chịu được những buổi chạy bền dài; nhưng không phải ai cũng như thế. Với tôi, các tiết học đó khá tốn thời gian, vì tôi chỉ thích ở trong nhà và đọc sách."
      }
    ],
    "questions": [
      {
        "id": 8,
        "questionNumber": 1,
        "question": "Who enjoy playing extreme sports after first attempt?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: Jose\n\n📌 Dẫn chứng trích đoạn:\n\"I fell in love with this sport ever since my first attempt.\"\n-> Dịch: \"Tôi đã mê môn này ngay từ lần thử đầu tiên.\"\n\n💡 Mẹo ghi nhớ cho Jose:\nKhông thích thể thao (I don’t usually like sports) -> Thích thể thao mạo hiểm ngay lần thử đầu tiên (first attempt / fell in love) -> Chú trọng tập luyện / hướng dẫn từ chuyên gia trước khi chơi (training / guidance from expert trainers).",
        "mnemonicHint": "Không thích thể thao (I don’t usually like sports) -> Thích thể thao mạo hiểm ngay lần thử đầu tiên (first attempt / fell in love) -> Chú trọng tập luyện / hướng dẫn từ chuyên gia trước khi chơi (training / guidance from expert trainers)."
      },
      {
        "id": 9,
        "questionNumber": 2,
        "question": "Who enjoys the nature while doing sports?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Sira\n\n📌 Dẫn chứng trích đoạn:\n\"Once I am in the water, I feel at home. I am surrounded by various types of fish and can almost touch them.\"\n-> Dịch: \"Mỗi khi ở dưới nước, tôi cảm giác thoải mái như đang ở nhà. Tôi được bao quanh bởi đủ loại cá và gần như có thể chạm tay vào chúng.\"\n\n💡 Mẹo ghi nhớ cho Sira:\nLặn tự do (free-diving) -> Tận hưởng thiên nhiên, hòa mình cùng đàn cá (nature / surrounded by various types of fish) -> Sống xa biển nên ước được chơi thường xuyên hơn (wishes do more often / a few times a year is never enough).",
        "mnemonicHint": "Lặn tự do (free-diving) -> Tận hưởng thiên nhiên, hòa mình cùng đàn cá (nature / surrounded by various types of fish) -> Sống xa biển nên ước được chơi thường xuyên hơn (wishes do more often / a few times a year is never enough)."
      },
      {
        "id": 10,
        "questionNumber": 3,
        "question": "Who avoid doing any sports?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Bao\n\n📌 Dẫn chứng trích đoạn:\n\"For me, these lessons were rather a waste of time, as I preferred staying indoors and reading books.\"\n-> Dịch: \"Với tôi, các tiết học đó khá tốn thời gian, vì tôi chỉ thích ở trong nhà và đọc sách.\"\n\n💡 Mẹo ghi nhớ cho Bao:\nHồi nhỏ phải học thể dục ở trường (as a child / school curriculum) -> Thấy tốn thời gian, né tránh thể thao, chỉ thích ở nhà đọc sách (avoid doing any sports / waste of time / indoors and reading books).",
        "mnemonicHint": "Hồi nhỏ phải học thể dục ở trường (as a child / school curriculum) -> Thấy tốn thời gian, né tránh thể thao, chỉ thích ở nhà đọc sách (avoid doing any sports / waste of time / indoors and reading books)."
      },
      {
        "id": 11,
        "questionNumber": 4,
        "question": "Who think extreme sports are not necessary for them?",
        "correctPersonIndex": 1,
        "explanation": "Đáp án đúng: Marisol\n\n📌 Dẫn chứng trích đoạn:\n\"I’m a pilot, and I have never understood why people would throw themselves into such danger... My job is already overwhelming and involves enough risky activities.\"\n-> Dịch: \"Tôi là một phi công, và tôi chưa bao giờ hiểu nổi tại sao người ta lại lao mình vào những mối nguy hiểm như vậy... Công việc của tôi vốn đã quá áp lực và có thừa các hoạt động rủi ro rồi.\"\n\n💡 Mẹo ghi nhớ cho Marisol:\nLà phi công (pilot) -> Thấy thể thao mạo hiểm không cần thiết / nguy hiểm thừa thãi (not necessary / why throw themselves into danger) -> Thích thể thao truyền thống, thông thường hơn như bóng chày, bóng chuyền (traditional sports / casual / baseball or volleyball).",
        "mnemonicHint": "Là phi công (pilot) -> Thấy thể thao mạo hiểm không cần thiết / nguy hiểm thừa thãi (not necessary / why throw themselves into danger) -> Thích thể thao truyền thống, thông thường hơn như bóng chày, bóng chuyền (traditional sports / casual / baseball or volleyball)."
      },
      {
        "id": 12,
        "questionNumber": 5,
        "question": "Who think training is important before doing extreme sports?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: Jose\n\n📌 Dẫn chứng trích đoạn:\n\"before I decided to take it up as a hobby, I made sure that I fully understood all the guidance from my expert trainers, who have years of experience.\"\n-> Dịch: \"trước khi quyết định chọn nó làm sở thích, tôi đảm bảo rằng mình đã nắm rất rõ mọi hướng dẫn từ các huấn luyện viên chuyên nghiệp nhiều năm kinh nghiệm.\"\n\n💡 Mẹo ghi nhớ cho Jose:\nKhông thích thể thao (I don’t usually like sports) -> Thích thể thao mạo hiểm ngay lần thử đầu tiên (first attempt / fell in love) -> Chú trọng tập luyện / hướng dẫn từ chuyên gia trước khi chơi (training / guidance from expert trainers).",
        "mnemonicHint": "Không thích thể thao (I don’t usually like sports) -> Thích thể thao mạo hiểm ngay lần thử đầu tiên (first attempt / fell in love) -> Chú trọng tập luyện / hướng dẫn từ chuyên gia trước khi chơi (training / guidance from expert trainers)."
      },
      {
        "id": 13,
        "questionNumber": 6,
        "question": "Who wishes they are able to do extreme sports more often?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Sira\n\n📌 Dẫn chứng trích đoạn:\n\"I can only do it a few times a year, which is never enough to satisfy my passion.\"\n-> Dịch: \"Tôi chỉ có thể đi lặn vài lần mỗi năm, và chừng đó không bao giờ là đủ để thỏa mãn niềm đam mê của tôi.\"\n\n💡 Mẹo ghi nhớ cho Sira:\nLặn tự do (free-diving) -> Tận hưởng thiên nhiên, hòa mình cùng đàn cá (nature / surrounded by various types of fish) -> Sống xa biển nên ước được chơi thường xuyên hơn (wishes do more often / a few times a year is never enough).",
        "mnemonicHint": "Lặn tự do (free-diving) -> Tận hưởng thiên nhiên, hòa mình cùng đàn cá (nature / surrounded by various types of fish) -> Sống xa biển nên ước được chơi thường xuyên hơn (wishes do more often / a few times a year is never enough)."
      },
      {
        "id": 14,
        "questionNumber": 7,
        "question": "Who prefer traditional sports?",
        "correctPersonIndex": 1,
        "explanation": "Đáp án đúng: Marisol\n\n📌 Dẫn chứng trích đoạn:\n\"Now, I prefer something more casual, such as baseball or volleyball.\"\n-> Dịch: \"Giờ đây, tôi thích những môn thể thao nhẹ nhàng, phổ thông hơn như bóng chày hay bóng chuyền.\"\n\n💡 Mẹo ghi nhớ cho Marisol:\nLà phi công (pilot) -> Thấy thể thao mạo hiểm không cần thiết / nguy hiểm thừa thãi (not necessary / why throw themselves into danger) -> Thích thể thao truyền thống, thông thường hơn như bóng chày, bóng chuyền (traditional sports / casual / baseball or volleyball).",
        "mnemonicHint": "Là phi công (pilot) -> Thấy thể thao mạo hiểm không cần thiết / nguy hiểm thừa thãi (not necessary / why throw themselves into danger) -> Thích thể thao truyền thống, thông thường hơn như bóng chày, bóng chuyền (traditional sports / casual / baseball or volleyball)."
      }
    ]
  },
  {
    "id": "topic-3",
    "topicNumber": 3,
    "title": "Childhood activities",
    "titleVi": "Hoạt động thời thơ ấu (Childhood activities)",
    "category": "Aptis Reading Part 4",
    "people": [
      "Sarah",
      "William",
      "Sophia",
      "Jack"
    ],
    "paragraphs": [
      {
        "personIndex": 0,
        "personName": "Sarah",
        "contentEn": "As a child, I played board games with my friends. The rules were simple, easy and straightforward to grasp, which made the games enjoyable and accessible. As I grew older, I came to believe that board games could be a wonderful way for families to bond. However, modern games have become far more complex, with numerous rules and a wide range of characters to choose from. Although I truly enjoyed playing with my two boys and we often laughed together, I found that learning how to play required quite a bit of effort.",
        "contentVi": "Khi còn nhỏ, tôi thường chơi cờ bàn (board game) với bạn bè. Luật chơi rất đơn giản, dễ hiểu và dễ nắm bắt, khiến các trò chơi trở nên thú vị và dễ tiếp cận. Khi lớn hơn, tôi tin rằng board game là cách tuyệt vời để gắn kết gia đình. Tuy nhiên, các trò chơi hiện đại đã trở nên phức tạp hơn nhiều, với vô số luật lệ và nhiều nhân vật để lựa chọn. Dù tôi rất thích chơi cùng hai cậu con trai và chúng tôi thường cười đùa vui vẻ, tôi thấy việc học cách chơi cũng đòi hỏi không ít nỗ lực."
      },
      {
        "personIndex": 1,
        "personName": "William",
        "contentEn": "I preferred to play outdoors with my friends (peers) when I was small. Fortunately, the weather where we lived was usually pleasant, so we often spent hours running around and chasing each other on the field. At times, we would lie down on the grass and make funny faces, enjoying the carefree moments of childhood. Those memories remain incredibly precious to me and shaped my desire to be surrounded by people. Even now, I find it difficult to stay at home alone for long.",
        "contentVi": "Khi còn nhỏ, tôi thích chơi ngoài trời cùng bạn bè hơn. May mắn thay, thời tiết nơi chúng tôi sống thường rất dễ chịu, nên chúng tôi thường dành hàng giờ chạy nhảy và đuổi bắt nhau trên cánh đồng. Đôi khi, chúng tôi nằm dài trên cỏ, làm những trò đùa hài hước và tận hưởng những khoảnh khắc tuổi thơ vô tư lự. Những ký ức ấy vẫn vô cùng quý giá đối với tôi và hình thành nên mong muốn được ở bên cạnh mọi người. Ngay cả bây giờ, tôi vẫn thấy khó mà ở nhà một mình quá lâu."
      },
      {
        "personIndex": 2,
        "personName": "Sophia",
        "contentEn": "I wasn’t able to move much as a child and even now. Instead, I was captivated by books (books are my companions) and often preferred reading in my free time. There was a library I frequently visited, where I could lose myself in different stories for hours. Nowadays, I don’t read as much as I used to, but I also don’t go out very often because I spend time on my computer. I especially enjoy interactive games, as they allow me to socialize and connect with people online.",
        "contentVi": "Hồi bé và ngay cả bây giờ, tôi đều không thể vận động nhiều. Thay vào đó, tôi bị cuốn hút bởi những cuốn sách (sách là những người bạn đồng hành của tôi) và thường thích đọc sách vào thời gian rảnh. Có một thư viện tôi thường xuyên ghé thăm, nơi tôi có thể đắm chìm vào những câu chuyện khác nhau suốt nhiều giờ. Ngày nay, tôi không còn đọc nhiều như trước, nhưng tôi cũng không hay ra ngoài vì dành phần lớn thời gian bên máy tính. Tôi đặc biệt thích các trò chơi tương tác vì chúng cho phép tôi giao lưu và kết nối với mọi người qua mạng."
      },
      {
        "personIndex": 3,
        "personName": "Jack",
        "contentEn": "I enjoy playing outdoors. On gloomy days, which happened quite often, I would stare sadly out of the window, wishing I could be outside. There wasn’t much to do indoors back then—until one day my mother surprised me with a box full of art supplies. Inside were vibrant palettes, paintbrushes of different sizes, and stacks of clean paper. That was the moment I discovered another passion: painting. I could spend hours simply gazing at a blank canvas, imagining what picture I might bring to life next.",
        "contentVi": "Tôi thích chơi ở ngoài trời. Vào những ngày thời tiết ảm đạm—điều xảy ra khá thường xuyên—tôi thường buồn bã nhìn ra ngoài cửa sổ và ước mình có thể được ra ngoài. Hồi đó ở trong nhà chẳng có mấy việc để làm—cho đến một ngày, mẹ làm tôi bất ngờ với một chiếc hộp đầy ắp dụng cụ mỹ thuật. Bên trong là những bảng màu rực rỡ, những cây cọ vẽ đủ kích cỡ và những xấp giấy trắng tinh. Đó là khoảnh khắc tôi khám phá ra một niềm đam mê mới: hội họa. Tôi có thể dành hàng giờ chỉ để ngắm nhìn một khung vẽ trắng tinh, tưởng tượng xem bức tranh tiếp theo mình sẽ vẽ nên là gì."
      }
    ],
    "questions": [
      {
        "id": 15,
        "questionNumber": 1,
        "question": "Who preferred reading books as a child?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Sophia\n\n📌 Dẫn chứng trích đoạn:\n\"Instead, I was captivated by books (books are my companions) and often preferred reading in my free time.\"\n-> Dịch: \"Thay vào đó, tôi bị cuốn hút bởi những cuốn sách (sách là những người bạn đồng hành của tôi) và thường thích đọc sách vào thời gian rảnh.\"\n\n💡 Mẹo ghi nhớ cho Sophia:\nÍt vận động, đắm chìm vào sách vở từ bé (preferred reading books / captivated by books) -> Hiện tại thích chơi game tương tác trên máy tính để kết nối bạn bè (modern games / interactive games).",
        "mnemonicHint": "Ít vận động, đắm chìm vào sách vở từ bé (preferred reading books / captivated by books) -> Hiện tại thích chơi game tương tác trên máy tính để kết nối bạn bè (modern games / interactive games)."
      },
      {
        "id": 16,
        "questionNumber": 2,
        "question": "Who enjoyed doing arts as a child?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Jack\n\n📌 Dẫn chứng trích đoạn:\n\"Inside were vibrant palettes, paintbrushes of different sizes, and stacks of clean paper. That was the moment I discovered another passion: painting.\"\n-> Dịch: \"Bên trong là những bảng màu rực rỡ, những cây cọ vẽ đủ kích cỡ và những xấp giấy trắng tinh. Đó là khoảnh khắc tôi khám phá ra một niềm đam mê mới: hội họa.\"\n\n💡 Mẹo ghi nhớ cho Jack:\nThích ra ngoài nên hay ước được ra ngoài vào những ngày u ám (wished could spend more time outdoors / wishing I could be outside) -> Được mẹ tặng đồ vẽ nên mê hội họa/nghệ thuật (enjoyed doing arts / art supplies, painting).",
        "mnemonicHint": "Thích ra ngoài nên hay ước được ra ngoài vào những ngày u ám (wished could spend more time outdoors / wishing I could be outside) -> Được mẹ tặng đồ vẽ nên mê hội họa/nghệ thuật (enjoyed doing arts / art supplies, painting)."
      },
      {
        "id": 17,
        "questionNumber": 3,
        "question": "Who enjoyed playing with other children in the past?",
        "correctPersonIndex": 1,
        "explanation": "Đáp án đúng: William\n\n📌 Dẫn chứng trích đoạn:\n\"I preferred to play outdoors with my friends (peers) when I was small... we often spent hours running around and chasing each other on the field.\"\n-> Dịch: \"Khi còn nhỏ, tôi thích chơi ngoài trời cùng bạn bè hơn... chúng tôi thường dành hàng giờ chạy nhảy và đuổi bắt nhau trên cánh đồng.\"\n\n💡 Mẹo ghi nhớ cho William:\nThích chơi ngoài trời với bạn bè lúc nhỏ (playing with other children / outdoors with my friends / peers) -> Kỷ niệm đẹp định hình tính cách thích ở cạnh mọi người.",
        "mnemonicHint": "Thích chơi ngoài trời với bạn bè lúc nhỏ (playing with other children / outdoors with my friends / peers) -> Kỷ niệm đẹp định hình tính cách thích ở cạnh mọi người."
      },
      {
        "id": 18,
        "questionNumber": 4,
        "question": "Who thought traditional games were much simpler?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: Sarah\n\n📌 Dẫn chứng trích đoạn:\n\"The rules were simple, easy and straightforward to grasp, which made the games enjoyable and accessible... However, modern games have become far more complex...\"\n-> Dịch: \"Luật chơi rất đơn giản, dễ hiểu và dễ nắm bắt, khiến các trò chơi trở nên thú vị và dễ tiếp cận... Tuy nhiên, các trò chơi hiện đại đã trở nên phức tạp hơn nhiều...\"\n\n💡 Mẹo ghi nhớ cho Sarah:\nChơi board game từ nhỏ -> Thấy trò chơi truyền thống đơn giản hơn nhiều (traditional games were much simpler / simple, easy to grasp) -> Thích chơi game cùng hai con trai (playing games with their children / my two boys).",
        "mnemonicHint": "Chơi board game từ nhỏ -> Thấy trò chơi truyền thống đơn giản hơn nhiều (traditional games were much simpler / simple, easy to grasp) -> Thích chơi game cùng hai con trai (playing games with their children / my two boys)."
      },
      {
        "id": 19,
        "questionNumber": 5,
        "question": "Who enjoyed playing games with their children?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: Sarah\n\n📌 Dẫn chứng trích đoạn:\n\"Although I truly enjoyed playing with my two boys and we often laughed together, I found that learning how to play required quite a bit of effort.\"\n-> Dịch: \"Dù tôi rất thích chơi cùng hai cậu con trai và chúng tôi thường cười đùa vui vẻ, tôi thấy việc học cách chơi cũng đòi hỏi không ít nỗ lực.\"\n\n💡 Mẹo ghi nhớ cho Sarah:\nChơi board game từ nhỏ -> Thấy trò chơi truyền thống đơn giản hơn nhiều (traditional games were much simpler / simple, easy to grasp) -> Thích chơi game cùng hai con trai (playing games with their children / my two boys).",
        "mnemonicHint": "Chơi board game từ nhỏ -> Thấy trò chơi truyền thống đơn giản hơn nhiều (traditional games were much simpler / simple, easy to grasp) -> Thích chơi game cùng hai con trai (playing games with their children / my two boys)."
      },
      {
        "id": 20,
        "questionNumber": 6,
        "question": "Who wished they could spend more time outdoors?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Jack\n\n📌 Dẫn chứng trích đoạn:\n\"On gloomy days, which happened quite often, I would stare sadly out of the window, wishing I could be outside.\"\n-> Dịch: \"Vào những ngày thời tiết ảm đạm—điều xảy ra khá thường xuyên—tôi thường buồn bã nhìn ra ngoài cửa sổ và ước mình có thể được ra ngoài.\"\n\n💡 Mẹo ghi nhớ cho Jack:\nThích ra ngoài nên hay ước được ra ngoài vào những ngày u ám (wished could spend more time outdoors / wishing I could be outside) -> Được mẹ tặng đồ vẽ nên mê hội họa/nghệ thuật (enjoyed doing arts / art supplies, painting).",
        "mnemonicHint": "Thích ra ngoài nên hay ước được ra ngoài vào những ngày u ám (wished could spend more time outdoors / wishing I could be outside) -> Được mẹ tặng đồ vẽ nên mê hội họa/nghệ thuật (enjoyed doing arts / art supplies, painting)."
      },
      {
        "id": 21,
        "questionNumber": 7,
        "question": "Who enjoyed playing modern games?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Sophia\n\n📌 Dẫn chứng trích đoạn:\n\"I especially enjoy interactive games, as they allow me to socialize and connect with people online.\"\n-> Dịch: \"Tôi đặc biệt thích các trò chơi tương tác vì chúng cho phép tôi giao lưu và kết nối với mọi người qua mạng.\"\n\n💡 Mẹo ghi nhớ cho Sophia:\nÍt vận động, đắm chìm vào sách vở từ bé (preferred reading books / captivated by books) -> Hiện tại thích chơi game tương tác trên máy tính để kết nối bạn bè (modern games / interactive games).",
        "mnemonicHint": "Ít vận động, đắm chìm vào sách vở từ bé (preferred reading books / captivated by books) -> Hiện tại thích chơi game tương tác trên máy tính để kết nối bạn bè (modern games / interactive games)."
      }
    ]
  },
  {
    "id": "topic-4",
    "topicNumber": 4,
    "title": "Volunteering",
    "titleVi": "Hoạt động tình nguyện (Volunteering)",
    "category": "Aptis Reading Part 4",
    "people": [
      "Boyd",
      "Chirish",
      "Noah",
      "Chinua"
    ],
    "paragraphs": [
      {
        "personIndex": 0,
        "personName": "Boyd",
        "contentEn": "I understand may young people like volunteering abroad, but honestly, I feel most people are more interested in traveling. I believe we should use our time more meaningfully. Each town has many people in need. Their situations are difficult, and they don’t have the means to improve their quality of life. They are individuals who have contributed a lot to the country. Sharing stories with them helps us understand the differences between generations. We can also broaden our knowledge about local history, traditions, and culture through their experiences.",
        "contentVi": "Tôi hiểu nhiều người trẻ thích đi tình nguyện ở nước ngoài, nhưng thành thực mà nói, tôi cảm thấy hầu hết mọi người quan tâm đến việc đi du lịch nhiều hơn. Tôi tin rằng chúng ta nên sử dụng thời gian của mình một cách ý nghĩa hơn. Mỗi thị trấn đều có rất nhiều người cần giúp đỡ. Hoàn cảnh của họ khó khăn và họ không có điều kiện để cải thiện chất lượng cuộc sống. Họ là những người đã đóng góp rất nhiều cho đất nước. Việc chia sẻ những câu chuyện với họ giúp chúng ta hiểu thêm sự khác biệt giữa các thế hệ. Chúng ta cũng có thể mở rộng kiến thức về lịch sử, truyền thống và văn hóa địa phương qua những trải nghiệm của họ."
      },
      {
        "personIndex": 1,
        "personName": "Chirish",
        "contentEn": "My mother was very involved with local charities because she is part of that organization, but I’m not into it. I prefer volunteering abroad because I can develop soft skills – something that will benefit my future career. Also, meeting new people helps me expand my network and create valuable connections I can use later in my professional life.",
        "contentVi": "Mẹ tôi từng tham gia rất nhiều vào các hoạt động từ thiện tại địa phương vì bà là thành viên của tổ chức đó, nhưng tôi thì không hào hứng lắm. Tôi thích đi tình nguyện ở nước ngoài hơn vì tôi có thể phát triển các kỹ năng mềm – điều sẽ mang lại lợi ích cho sự nghiệp tương lai của tôi. Ngoài ra, việc gặp gỡ những người mới giúp tôi mở rộng mạng lưới quan hệ và tạo ra những kết nối giá trị mà tôi có thể tận dụng sau này trong công việc."
      },
      {
        "personIndex": 2,
        "personName": "Noah",
        "contentEn": "I’m busy with work these days and rarely have any free time to do anything, so spending even a few hours volunteering is difficult. I would have to take half a day off work. I see many people in need and they genuinely require some extra financial support. That’s something I can help with because I earn a good salary. Making monthly donations is not a problem for me it’s how I show my support and contribution.",
        "contentVi": "Dạo này tôi rất bận rộn với công việc và hiếm khi có thời gian rảnh rỗi để làm việc gì, vì vậy việc dành dù chỉ vài giờ đi làm tình nguyện cũng rất khó khăn. Tôi sẽ phải xin nghỉ làm nửa ngày. Tôi thấy có rất nhiều người có hoàn cảnh khó khăn và họ thực sự cần thêm hỗ trợ về tài chính. Đó là điều mà tôi có thể giúp đỡ vì tôi có mức lương tốt. Quyên góp tiền hàng tháng không phải là vấn đề đối với tôi, đó là cách tôi thể hiện sự ủng hộ và đóng góp của mình."
      },
      {
        "personIndex": 3,
        "personName": "Chinua",
        "contentEn": "I don’t have many financial resources but I believe there are many ways we can show kindness through volunteering. I’m retired now, and I currently help build houses for people in need. I work with a volunteering organization that already has clear plans in place. Through this work, I’ve had the chance to experience different foreign cultures. We’re often sent to various countries to carry out these projects, so it’s also a great way to travel while doing something meaningful. The job involves manual labor, so we’re able to improve our physical health something that some people only begin to notice after a while.",
        "contentVi": "Tôi không có nhiều tiềm lực tài chính nhưng tôi tin rằng có rất nhiều cách để chúng ta thể hiện lòng tốt thông qua việc làm tình nguyện. Bây giờ tôi đã nghỉ hưu, và hiện tại tôi đang hỗ trợ xây nhà cho những người cần giúp đỡ. Tôi làm việc với một tổ chức tình nguyện đã có sẵn các kế hoạch rõ ràng. Thông qua công việc này, tôi có cơ hội trải nghiệm các nền văn hóa nước ngoài khác nhau. Chúng tôi thường được cử đến nhiều quốc gia khác nhau để thực hiện các dự án này, vì vậy đây cũng là một cách tuyệt vời để đi du lịch trong khi làm điều gì đó có ý nghĩa. Công việc này bao gồm lao động chân tay, nhờ đó chúng tôi có thể cải thiện sức khỏe thể chất – điều mà một số người chỉ bắt đầu nhận ra sau một thời gian."
      }
    ],
    "questions": [
      {
        "id": 22,
        "questionNumber": 1,
        "question": "Who thinks volunteering enjoys physical benefits?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Chinua\n\n📌 Dẫn chứng trích đoạn:\n\"The job involves manual labor, so we’re able to improve our physical health something that some people only begin to notice after a while.\"\n-> Dịch: \"Công việc này bao gồm lao động chân tay, nhờ đó chúng tôi có thể cải thiện sức khỏe thể chất – điều mà một số người chỉ bắt đầu nhận ra sau một thời gian.\"\n\n💡 Mẹo ghi nhớ cho Chinua:\nĐã nghỉ hưu đi xây nhà thiện nguyện (retired, build houses) -> Cơ hội tuyệt vời để đi du lịch các nước (reason to travel / great way to travel) -> Lao động chân tay giúp rèn luyện thể chất/sức khỏe (physical benefits / improve our physical health).",
        "mnemonicHint": "Đã nghỉ hưu đi xây nhà thiện nguyện (retired, build houses) -> Cơ hội tuyệt vời để đi du lịch các nước (reason to travel / great way to travel) -> Lao động chân tay giúp rèn luyện thể chất/sức khỏe (physical benefits / improve our physical health)."
      },
      {
        "id": 23,
        "questionNumber": 2,
        "question": "Who thinks volunteering is a good way to make friends?",
        "correctPersonIndex": 1,
        "explanation": "Đáp án đúng: Chirish\n\n📌 Dẫn chứng trích đoạn:\n\"Also, meeting new people helps me expand my network and create valuable connections I can use later in my professional life.\"\n-> Dịch: \"Ngoài ra, việc gặp gỡ những người mới giúp tôi mở rộng mạng lưới quan hệ và tạo ra những kết nối giá trị mà tôi có thể tận dụng sau này trong công việc.\"\n\n💡 Mẹo ghi nhớ cho Chirish:\nTình nguyện để phát triển kỹ năng mềm cho sự nghiệp (advance career / soft skills benefit future career) -> Kết bạn mới, mở rộng mối quan hệ (make friends / meeting new people, expand network).",
        "mnemonicHint": "Tình nguyện để phát triển kỹ năng mềm cho sự nghiệp (advance career / soft skills benefit future career) -> Kết bạn mới, mở rộng mối quan hệ (make friends / meeting new people, expand network)."
      },
      {
        "id": 24,
        "questionNumber": 3,
        "question": "Who thinks volunteering is a good reason to travel?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Chinua\n\n📌 Dẫn chứng trích đoạn:\n\"We’re often sent to various countries to carry out these projects, so it’s also a great way to travel while doing something meaningful.\"\n-> Dịch: \"Chúng tôi thường được cử đến nhiều quốc gia khác nhau để thực hiện các dự án này, vì vậy đây cũng là một cách tuyệt vời để đi du lịch trong khi làm điều gì đó có ý nghĩa.\"\n\n💡 Mẹo ghi nhớ cho Chinua:\nĐã nghỉ hưu đi xây nhà thiện nguyện (retired, build houses) -> Cơ hội tuyệt vời để đi du lịch các nước (reason to travel / great way to travel) -> Lao động chân tay giúp rèn luyện thể chất/sức khỏe (physical benefits / improve our physical health).",
        "mnemonicHint": "Đã nghỉ hưu đi xây nhà thiện nguyện (retired, build houses) -> Cơ hội tuyệt vời để đi du lịch các nước (reason to travel / great way to travel) -> Lao động chân tay giúp rèn luyện thể chất/sức khỏe (physical benefits / improve our physical health)."
      },
      {
        "id": 25,
        "questionNumber": 4,
        "question": "Who thinks volunteering should help local communities?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: Boyd\n\n📌 Dẫn chứng trích đoạn:\n\"Each town has many people in need. Their situations are difficult, and they don’t have the means to improve their quality of life. They are individuals who have contributed a lot to the country.\"\n-> Dịch: \"Mỗi thị trấn đều có rất nhiều người cần giúp đỡ. Hoàn cảnh của họ khó khăn và họ không có điều kiện để cải thiện chất lượng cuộc sống. Họ là những người đã đóng góp rất nhiều cho đất nước.\"\n\n💡 Mẹo ghi nhớ cho Boyd:\nGiúp đỡ cộng đồng địa phương (local communities / Each town has many people in need) -> Hiểu thêm về truyền thống, văn hóa địa phương (good for culture / local history, traditions, and culture).",
        "mnemonicHint": "Giúp đỡ cộng đồng địa phương (local communities / Each town has many people in need) -> Hiểu thêm về truyền thống, văn hóa địa phương (good for culture / local history, traditions, and culture)."
      },
      {
        "id": 26,
        "questionNumber": 5,
        "question": "Who thinks volunteering is good for culture?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: Boyd\n\n📌 Dẫn chứng trích đoạn:\n\"We can also broaden our knowledge about local history, traditions, and culture through their experiences.\"\n-> Dịch: \"Chúng ta cũng có thể mở rộng kiến thức về lịch sử, truyền thống và văn hóa địa phương qua những trải nghiệm của họ.\"\n\n💡 Mẹo ghi nhớ cho Boyd:\nGiúp đỡ cộng đồng địa phương (local communities / Each town has many people in need) -> Hiểu thêm về truyền thống, văn hóa địa phương (good for culture / local history, traditions, and culture).",
        "mnemonicHint": "Giúp đỡ cộng đồng địa phương (local communities / Each town has many people in need) -> Hiểu thêm về truyền thống, văn hóa địa phương (good for culture / local history, traditions, and culture)."
      },
      {
        "id": 27,
        "questionNumber": 6,
        "question": "Who thinks volunteering can help advance career?",
        "correctPersonIndex": 1,
        "explanation": "Đáp án đúng: Chirish\n\n📌 Dẫn chứng trích đoạn:\n\"I prefer volunteering abroad because I can develop soft skills – something that will benefit my future career.\"\n-> Dịch: \"Tôi thích đi tình nguyện ở nước ngoài hơn vì tôi có thể phát triển các kỹ năng mềm – điều sẽ mang lại lợi ích cho sự nghiệp tương lai của tôi.\"\n\n💡 Mẹo ghi nhớ cho Chirish:\nTình nguyện để phát triển kỹ năng mềm cho sự nghiệp (advance career / soft skills benefit future career) -> Kết bạn mới, mở rộng mối quan hệ (make friends / meeting new people, expand network).",
        "mnemonicHint": "Tình nguyện để phát triển kỹ năng mềm cho sự nghiệp (advance career / soft skills benefit future career) -> Kết bạn mới, mở rộng mối quan hệ (make friends / meeting new people, expand network)."
      },
      {
        "id": 28,
        "questionNumber": 7,
        "question": "Who thinks volunteering can be helped by giving money?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Noah\n\n📌 Dẫn chứng trích đoạn:\n\"Making monthly donations is not a problem for me it’s how I show my support and contribution.\"\n-> Dịch: \"Quyên góp tiền hàng tháng không phải là vấn đề đối với tôi, đó là cách tôi thể hiện sự ủng hộ và đóng góp của mình.\"\n\n💡 Mẹo ghi nhớ cho Noah:\nBận rộn công việc, không có thời gian đi làm tình nguyện trực tiếp (busy with work / rarely have free time) -> Đóng góp, giúp đỡ bằng tiền/quyên góp hàng tháng (giving money / monthly donations / financial support).",
        "mnemonicHint": "Bận rộn công việc, không có thời gian đi làm tình nguyện trực tiếp (busy with work / rarely have free time) -> Đóng góp, giúp đỡ bằng tiền/quyên góp hàng tháng (giving money / monthly donations / financial support)."
      }
    ]
  },
  {
    "id": "topic-5",
    "topicNumber": 5,
    "title": "Choosing a Career",
    "titleVi": "Lựa chọn nghề nghiệp (Choosing a Career)",
    "category": "Aptis Reading Part 4",
    "people": [
      "Olivia",
      "Chirish",
      "Emma",
      "Grace"
    ],
    "paragraphs": [
      {
        "personIndex": 0,
        "personName": "Olivia",
        "contentEn": "When I finished school, I didn’t really know what I wanted to do. Some people advised me to get a job right away. However, I preferred to gain some practical experience first. That’s why I applied for many volunteering roles. Even though I didn’t earn any money, I was able to try different kinds of work. Looking back, I’m happy with my decision because of the useful knowledge I gained.",
        "contentVi": "Khi học xong, tôi thật sự không biết mình muốn làm gì. Một số người khuyên tôi nên đi làm ngay. Tuy nhiên, tôi lại muốn tích lũy thêm kinh nghiệm thực tế trước đã. Đó là lý do tôi đã nộp đơn cho nhiều công việc tình nguyện khác nhau. Mặc dù không kiếm được tiền, nhưng tôi có cơ hội thử nhiều loại công việc khác nhau. Nhìn lại, tôi thấy hài lòng với quyết định của mình vì những kiến thức hữu ích mà tôi đã học được."
      },
      {
        "personIndex": 1,
        "personName": "Chirish",
        "contentEn": "I went straight to university after I graduated from high school. I had always wanted to become a teacher, so there was no need to look at other careers. Three months ago, I joined an internship at a local school. It was really an eye-opening experience, although the workload was heavier than I thought. Still, I believe it was very worthwhile.",
        "contentVi": "Tôi đã vào thẳng đại học sau khi tốt nghiệp trung học. Tôi luôn muốn trở thành một giáo viên, nên không cần phải xem xét các nghề khác. Ba tháng trước, tôi đã tham gia một kỳ thực tập tại một trường học địa phương. Đó thực sự là một trải nghiệm mở mang tầm mắt, mặc dù khối lượng công việc nặng hơn tôi nghĩ. Tuy vậy, tôi tin rằng đó là một trải nghiệm rất đáng giá."
      },
      {
        "personIndex": 2,
        "personName": "Emma",
        "contentEn": "As a child, I lived near a plumber and sometimes worked with her. She asked me to do easy jobs like checking for pipe leaks or fastening the nails with a screw. So later, it felt natural for me to study at university to become an electrician. Now that I see there are short online electrical courses, I wish I had chosen that instead.",
        "contentVi": "Khi còn nhỏ, tôi sống gần một người thợ sửa ống nước và đôi khi làm việc cùng cô ấy. Cô ấy nhờ tôi làm những việc đơn giản như kiểm tra chỗ rò rỉ của ống hoặc vặn chặt đinh vít. Vì vậy, sau này tôi cảm thấy rất tự nhiên khi học đại học để trở thành thợ điện. Bây giờ khi thấy có các khóa học điện ngắn hạn trực tuyến, tôi ước gì mình đã chọn cách đó thay vì học đại học."
      },
      {
        "personIndex": 3,
        "personName": "Grace",
        "contentEn": "After school, I wanted some time to figure out what I really wanted. So I started looking for temporary jobs. However, it was difficult to find one because most companies didn’t accept people without experience. In the end, a game company contacted me and I agreed to work with them. The job was hybrid, so sometimes I worked in the evenings, but that was fine for me.",
        "contentVi": "Sau khi học xong, tôi muốn có thời gian để xác định rõ mình thật sự muốn gì. Vì vậy, tôi bắt đầu tìm kiếm các công việc tạm thời. Tuy nhiên, rất khó để tìm được vì hầu hết các công ty không nhận người chưa có kinh nghiệm. Cuối cùng, một công ty trò chơi đã liên hệ với tôi và tôi đồng ý làm việc với họ. Công việc theo hình thức kết hợp, nên đôi khi tôi làm vào buổi tối, nhưng điều đó hoàn toàn ổn với tôi."
      }
    ],
    "questions": [
      {
        "id": 29,
        "questionNumber": 1,
        "question": "Who enjoyed working when training?",
        "correctPersonIndex": 1,
        "explanation": "Đáp án đúng: Chirish\n\n📌 Dẫn chứng trích đoạn:\n\"Three months ago, I joined an internship at a local school. It was really an eye-opening experience, although the workload was heavier than I thought. Still, I believe it was very worthwhile.\"\n-> Dịch: \"Ba tháng trước, tôi đã tham gia một kỳ thực tập tại một trường học địa phương. Đó thực sự là một trải nghiệm mở mang tầm mắt, mặc dù khối lượng công việc nặng hơn tôi nghĩ. Tuy vậy, tôi tin rằng đó là một trải nghiệm rất đáng giá.\"\n\n💡 Mẹo ghi nhớ cho Chirish:\nChỉ muốn làm giáo viên, không muốn đổi nghề khác (not want to change to other careers / always wanted to become a teacher) -> Thích kỳ thực tập/tập huấn (enjoyed working when training / internship).",
        "mnemonicHint": "Chỉ muốn làm giáo viên, không muốn đổi nghề khác (not want to change to other careers / always wanted to become a teacher) -> Thích kỳ thực tập/tập huấn (enjoyed working when training / internship)."
      },
      {
        "id": 30,
        "questionNumber": 2,
        "question": "Who think they benefited from working for free?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: Olivia\n\n📌 Dẫn chứng trích đoạn:\n\"Even though I didn’t earn any money, I was able to try different kinds of work. Looking back, I’m happy with my decision because of the useful knowledge I gained.\"\n-> Dịch: \"Mặc dù không kiếm được tiền, nhưng tôi có cơ hội thử nhiều loại công việc khác nhau. Nhìn lại, tôi thấy hài lòng với quyết định của mình vì những kiến thức hữu ích mà tôi đã học được.\"\n\n💡 Mẹo ghi nhớ cho Olivia:\nLàm tình nguyện viên không công (working for free / volunteering roles / didn’t earn money) -> Nhận được lợi ích là kiến thức hữu ích (benefited from working for free / useful knowledge).",
        "mnemonicHint": "Làm tình nguyện viên không công (working for free / volunteering roles / didn’t earn money) -> Nhận được lợi ích là kiến thức hữu ích (benefited from working for free / useful knowledge)."
      },
      {
        "id": 31,
        "questionNumber": 3,
        "question": "Who thinks their training was too long?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Emma\n\n📌 Dẫn chứng trích đoạn:\n\"Now that I see there are short online electrical courses, I wish I had chosen that instead.\"\n-> Dịch: \"Bây giờ khi thấy có các khóa học điện ngắn hạn trực tuyến, tôi ước gì mình đã chọn cách đó thay vì học đại học.\"\n\n💡 Mẹo ghi nhớ cho Emma:\nThích làm việc bằng tay chân (doing things with their hands / checking pipe leaks, fastening screws) -> Tiếc vì học đại học quá dài thay vì học khóa ngắn hạn (training was too long / wish chosen short online courses).",
        "mnemonicHint": "Thích làm việc bằng tay chân (doing things with their hands / checking pipe leaks, fastening screws) -> Tiếc vì học đại học quá dài thay vì học khóa ngắn hạn (training was too long / wish chosen short online courses)."
      },
      {
        "id": 32,
        "questionNumber": 4,
        "question": "Who enjoys working in a flexible work environment?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Grace\n\n📌 Dẫn chứng trích đoạn:\n\"The job was hybrid, so sometimes I worked in the evenings, but that was fine for me.\"\n-> Dịch: \"Công việc theo hình thức kết hợp, nên đôi khi tôi làm vào buổi tối, nhưng điều đó hoàn toàn ổn với tôi.\"\n\n💡 Mẹo ghi nhớ cho Grace:\nThấy khó tìm được việc làm đầu tiên do thiếu kinh nghiệm (hard to get the first job / difficult to find one) -> Thích môi trường làm việc linh hoạt, kết hợp (flexible work environment / hybrid, work in the evenings).",
        "mnemonicHint": "Thấy khó tìm được việc làm đầu tiên do thiếu kinh nghiệm (hard to get the first job / difficult to find one) -> Thích môi trường làm việc linh hoạt, kết hợp (flexible work environment / hybrid, work in the evenings)."
      },
      {
        "id": 33,
        "questionNumber": 5,
        "question": "Who did not want to change to other careers?",
        "correctPersonIndex": 1,
        "explanation": "Đáp án đúng: Chirish\n\n📌 Dẫn chứng trích đoạn:\n\"I had always wanted to become a teacher, so there was no need to look at other careers.\"\n-> Dịch: \"Tôi luôn muốn trở thành một giáo viên, nên không cần phải xem xét các nghề khác.\"\n\n💡 Mẹo ghi nhớ cho Chirish:\nChỉ muốn làm giáo viên, không muốn đổi nghề khác (not want to change to other careers / always wanted to become a teacher) -> Thích kỳ thực tập/tập huấn (enjoyed working when training / internship).",
        "mnemonicHint": "Chỉ muốn làm giáo viên, không muốn đổi nghề khác (not want to change to other careers / always wanted to become a teacher) -> Thích kỳ thực tập/tập huấn (enjoyed working when training / internship)."
      },
      {
        "id": 34,
        "questionNumber": 6,
        "question": "Who thinks it was hard to get the first job?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Grace\n\n📌 Dẫn chứng trích đoạn:\n\"However, it was difficult to find one because most companies didn’t accept people without experience.\"\n-> Dịch: \"Tuy nhiên, rất khó để tìm được vì hầu hết các công ty không nhận người chưa có kinh nghiệm.\"\n\n💡 Mẹo ghi nhớ cho Grace:\nThấy khó tìm được việc làm đầu tiên do thiếu kinh nghiệm (hard to get the first job / difficult to find one) -> Thích môi trường làm việc linh hoạt, kết hợp (flexible work environment / hybrid, work in the evenings).",
        "mnemonicHint": "Thấy khó tìm được việc làm đầu tiên do thiếu kinh nghiệm (hard to get the first job / difficult to find one) -> Thích môi trường làm việc linh hoạt, kết hợp (flexible work environment / hybrid, work in the evenings)."
      },
      {
        "id": 35,
        "questionNumber": 7,
        "question": "Who enjoyed doing things with their hands?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Emma\n\n📌 Dẫn chứng trích đoạn:\n\"She asked me to do easy jobs like checking for pipe leaks or fastening the nails with a screw.\"\n-> Dịch: \"Cô ấy nhờ tôi làm những việc đơn giản như kiểm tra chỗ rò rỉ của ống hoặc vặn chặt đinh vít.\"\n\n💡 Mẹo ghi nhớ cho Emma:\nThích làm việc bằng tay chân (doing things with their hands / checking pipe leaks, fastening screws) -> Tiếc vì học đại học quá dài thay vì học khóa ngắn hạn (training was too long / wish chosen short online courses).",
        "mnemonicHint": "Thích làm việc bằng tay chân (doing things with their hands / checking pipe leaks, fastening screws) -> Tiếc vì học đại học quá dài thay vì học khóa ngắn hạn (training was too long / wish chosen short online courses)."
      }
    ]
  },
  {
    "id": "topic-6",
    "topicNumber": 6,
    "title": "Childhood activities (Bản 2)",
    "titleVi": "Hoạt động thời thơ ấu - Bản 2 (Childhood)",
    "category": "Aptis Reading Part 4",
    "people": [
      "A",
      "B",
      "C",
      "D"
    ],
    "paragraphs": [
      {
        "personIndex": 0,
        "personName": "Person A",
        "contentEn": "In the past, I really liked playing board games, now to limit the children from using computers, I often spend time playing with them, but I have struggled with them, the games nowadays have more characters and rules, making us think a lot every time we play, but my children and I still like it and have a good time and laugh together.",
        "contentVi": "Trước đây, tôi rất thích chơi cờ bàn (board games). Bây giờ để hạn chế các con dùng máy tính, tôi thường dành thời gian chơi cùng chúng, nhưng tôi đã gặp khá nhiều chật vật với chúng. Các trò chơi ngày nay có nhiều nhân vật và luật lệ hơn, khiến chúng tôi phải suy nghĩ rất nhiều mỗi khi chơi, nhưng các con tôi và tôi vẫn thích nó, có khoảng thời gian vui vẻ và cười đùa cùng nhau."
      },
      {
        "personIndex": 1,
        "personName": "Person B",
        "contentEn": "When I was a child, I often played soccer with other children of the same age, we often played football in the school yard and sometimes in the open spaces of the neighborhood. We divided into small teams and chased the ball until we were all tired.",
        "contentVi": "Khi còn nhỏ, tôi thường đá bóng với những đứa trẻ khác cùng tuổi, chúng tôi thường đá bóng trong sân trường và đôi khi ở những khoảng không gian mở của khu phố. Chúng tôi chia thành các đội nhỏ và đuổi theo bóng cho đến khi tất cả đều mệt nhoài."
      },
      {
        "personIndex": 2,
        "personName": "Person C",
        "contentEn": "When I was a child, I didn't like going out to play, so I chose reading books as a form of entertainment. The stories described in the pages of books helped me discover my own world. Later, when I grow up, I like playing modern games with eye-catching interfaces, which helps me relax and increase my creativity.",
        "contentVi": "Khi còn nhỏ, tôi không thích ra ngoài chơi, nên tôi chọn đọc sách như một hình thức giải trí. Những câu chuyện được miêu tả trên từng trang sách đã giúp tôi khám phá thế giới của riêng mình. Sau này khi lớn lên, tôi thích chơi các trò chơi hiện đại với giao diện bắt mắt, giúp tôi thư giãn và tăng cường tính sáng tạo."
      },
      {
        "personIndex": 3,
        "personName": "Person D",
        "contentEn": "When I was a child, I really liked playing outdoor activities. I remember on bad weather days, I was always by the window, glued to the window to look outside, praying for the rain to stop. At those times, my mother often gave me paper and a box of crayons, I really liked that drawing activity and often drew at home when the weather was not good.",
        "contentVi": "Khi còn nhỏ, tôi thực sự thích tham gia các hoạt động ngoài trời. Tôi nhớ vào những ngày thời tiết xấu, tôi luôn ở bên cửa sổ, dán mắt vào cửa sổ để nhìn ra ngoài, cầu nguyện cho mưa tạnh. Vào những lúc đó, mẹ thường cho tôi giấy và một hộp bút sáp màu, tôi thực sự thích hoạt động vẽ tranh đó và thường vẽ ở nhà khi thời tiết không tốt."
      }
    ],
    "questions": [
      {
        "id": 36,
        "questionNumber": 1,
        "question": "Who likes to play with children?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: Person A\n\n📌 Dẫn chứng trích đoạn:\n\"now to limit the children from using computers, I often spend time playing with them... but my children and I still like it and have a good time and laugh together.\"\n-> Dịch: \"bây giờ để hạn chế các con dùng máy tính, tôi thường dành thời gian chơi cùng chúng... nhưng các con và tôi vẫn thích và có khoảng thời gian vui vẻ, cùng cười đùa.\"\n\n💡 Mẹo ghi nhớ cho Person A:\nThích chơi với trẻ nhỏ (likes to play with children / spend time playing with them) & Thấy trò chơi ngày nay khó hơn nhiều (finds games nowadays much more difficult).",
        "mnemonicHint": "Thích chơi với trẻ nhỏ (likes to play with children) -> Person A."
      },
      {
        "id": 37,
        "questionNumber": 2,
        "question": "Who likes to play with other children in the past?",
        "correctPersonIndex": 1,
        "explanation": "Đáp án đúng: Person B\n\n📌 Dẫn chứng trích đoạn:\n\"When I was a child, I often played soccer with other children of the same age, we often played football in the school yard and sometimes in the open spaces of the neighborhood.\"\n-> Dịch: \"Khi còn nhỏ, tôi thường đá bóng với những đứa trẻ khác cùng tuổi, chúng tôi thường đá bóng trong sân trường và đôi khi ở những khoảng đất trống trong khu phố.\"\n\n💡 Mẹo ghi nhớ cho Person B:\nQuá khứ thích chơi với những đứa trẻ khác cùng tuổi (likes to play with other children in the past / played soccer with other children).",
        "mnemonicHint": "Thích chơi với những đứa trẻ khác trong quá khứ (play with other children in the past) -> Person B."
      },
      {
        "id": 38,
        "questionNumber": 3,
        "question": "Who looked forward to going out to play?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Person D\n\n📌 Dẫn chứng trích đoạn:\n\"When I was a child, I really liked playing outdoor activities. I remember on bad weather days, I was always by the window, glued to the window to look outside, praying for the rain to stop.\"\n-> Dịch: \"Khi còn nhỏ, tôi thực sự thích các hoạt động ngoài trời. Tôi nhớ vào những ngày thời tiết xấu, tôi luôn đứng bên cửa sổ, dán mắt vào cửa sổ nhìn ra ngoài, cầu cho mưa tạnh.\"\n\n💡 Mẹo ghi nhớ cho Person D:\nMong ngóng được ra ngoài chơi (looked forward to going out to play / glued to the window looking outside, praying for rain to stop) & Lúc nhỏ mê vẽ nghệ thuật (liked arts when he was a child / box of crayons, drawing).",
        "mnemonicHint": "Ngóng ra ngoài chơi lúc trời mưa (looked forward to going out to play) -> Person D."
      },
      {
        "id": 39,
        "questionNumber": 4,
        "question": "Who liked arts when he was a child?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Person D\n\n📌 Dẫn chứng trích đoạn:\n\"At those times, my mother often gave me paper and a box of crayons, I really liked that drawing activity and often drew at home when the weather was not good.\"\n-> Dịch: \"Những lúc đó, mẹ thường cho tôi giấy và một hộp bút màu sáp, tôi thực sự thích hoạt động vẽ tranh đó và thường vẽ ở nhà khi thời tiết không tốt.\"\n\n💡 Mẹo ghi nhớ cho Person D:\nLúc nhỏ thích nghệ thuật, hội họa (liked arts when he was a child / box of crayons, drawing activity).",
        "mnemonicHint": "Lúc nhỏ thích nghệ thuật hội họa (liked arts when he was a child) -> Person D."
      },
      {
        "id": 40,
        "questionNumber": 5,
        "question": "Who likes modern games when growing up?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Person C\n\n📌 Dẫn chứng trích đoạn:\n\"Later, when I grow up, I like playing modern games with eye-catching interfaces, which helps me relax and increase my creativity.\"\n-> Dịch: \"Sau này khi lớn lên, tôi thích chơi các trò chơi hiện đại với giao diện bắt mắt, giúp tôi thư giãn và tăng khả năng sáng tạo.\"\n\n💡 Mẹo ghi nhớ cho Person C:\nKhi lớn lên thích các trò chơi hiện đại (likes modern games when growing up) & Hồi nhỏ thích đọc sách (liked reading books when he/she was a child).",
        "mnemonicHint": "Lớn lên thích game hiện đại (likes modern games when growing up) -> Person C."
      },
      {
        "id": 41,
        "questionNumber": 6,
        "question": "Who finds the games nowadays much more difficult?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: Person A\n\n📌 Dẫn chứng trích đoạn:\n\"the games nowadays have more characters and rules, making us think a lot every time we play... but I have struggled with them\"\n-> Dịch: \"các trò chơi ngày nay có nhiều nhân vật và luật lệ hơn, khiến chúng tôi phải suy nghĩ rất nhiều mỗi khi chơi... nhưng tôi đã phải rất chật vật với chúng\"\n\n💡 Mẹo ghi nhớ cho Person A:\nThấy trò chơi ngày nay khó hơn nhiều (finds the games nowadays much more difficult / struggled, more characters and rules, think a lot).",
        "mnemonicHint": "Thấy game ngày nay phức tạp, khó hơn (finds games nowadays much more difficult) -> Person A."
      },
      {
        "id": 42,
        "questionNumber": 7,
        "question": "Who liked reading books when he was a child?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Person C\n\n📌 Dẫn chứng trích đoạn:\n\"When I was a child, I didn't like going out to play, so I chose reading books as a form of entertainment. The stories described in the pages of books helped me discover my own world.\"\n-> Dịch: \"Khi còn nhỏ, tôi không thích đi ra ngoài chơi nên tôi chọn đọc sách như một hình thức giải trí. Những câu chuyện được miêu tả trên từng trang sách giúp tôi khám phá thế giới của riêng mình.\"\n\n💡 Mẹo ghi nhớ cho Person C:\nHồi nhỏ thích đọc sách (liked reading books when he was a child) & Lớn lên thích game hiện đại (likes modern games when growing up).",
        "mnemonicHint": "Hồi nhỏ thích đọc sách (liked reading books when he was a child) -> Person C."
      }
    ]
  },
  {
    "id": "topic-7",
    "topicNumber": 7,
    "title": "Careers (Nghề nghiệp - Bản mới)",
    "titleVi": "Nghề nghiệp - Bản mới (Careers)",
    "category": "Aptis Reading Part 4",
    "people": [
      "Person A",
      "Person B",
      "Person C",
      "Person D"
    ],
    "paragraphs": [
      {
        "personIndex": 0,
        "personName": "Person A",
        "contentEn": "When I was a student, I decided to do an unpaid internship at organizations and companies. At first, my friends said it was a waste of time because I didn’t earn any money. However, I learned a lot of practical skills and gained real working experience. I also built good relationships with my colleagues, which later helped me find a full-time job more easily.",
        "contentVi": "Khi còn là sinh viên, tôi quyết định thực tập không lương tại các tổ chức và công ty. Ban đầu, bạn bè nói đó là sự lãng phí thời gian vì tôi không kiếm được đồng tiền nào. Tuy nhiên, tôi đã học được rất nhiều kỹ năng thực tế và tích lũy được kinh nghiệm làm việc thực sự. Tôi cũng xây dựng mối quan hệ tốt với các đồng nghiệp, điều này sau đó đã giúp tôi tìm được một công việc toàn thời gian dễ dàng hơn."
      },
      {
        "personIndex": 1,
        "personName": "Person B",
        "contentEn": "My dream job is becoming a teacher, and I have never thought about changing to another career. Teaching has always been my goal because I enjoy working with students and helping them learn new things. At the moment, I am studying hard to become a good teacher in the future. While I am still in training, I also work part-time at a school so that I can gain real teaching experience. I really enjoy working while studying because it helps me improve my skills and become more confident in the classroom. Even though it can be challenging sometimes, I believe this experience is very valuable, and I am happy to continue on this career path without changing my job plans.",
        "contentVi": "Công việc mơ ước của tôi là trở thành giáo viên, và tôi chưa bao giờ nghĩ đến việc chuyển sang nghề khác. Giảng dạy luôn là mục tiêu của tôi vì tôi thích làm việc với học sinh và giúp các em học hỏi những điều mới. Hiện tại, tôi đang học tập chăm chỉ để trở thành một giáo viên giỏi trong tương lai. Trong khi vẫn đang trong quá trình đào tạo, tôi cũng làm việc bán thời gian tại một trường học để tích lũy kinh nghiệm giảng dạy thực tế. Tôi thực sự thích vừa học vừa làm vì nó giúp tôi nâng cao kỹ năng và tự tin hơn trong lớp học. Mặc dù đôi khi có thể có nhiều thử thách, tôi tin rằng trải nghiệm này rất quý giá và tôi rất vui khi tiếp tục theo đuổi con đường sự nghiệp này mà không thay đổi kế hoạch công việc của mình."
      },
      {
        "personIndex": 2,
        "personName": "Person C",
        "contentEn": "When I was a child I worked with a plumber and helped her with fixing things. I love a career in mechanical engineering because I enjoy making and repairing things by hand. However, the training period was much longer than I expected, about 2 years. Sometimes I felt tired of studying theory for so many years before actually starting work. Still, I believe the skills I learned will be useful in the long run.",
        "contentVi": "Khi còn nhỏ, tôi đã làm việc với một người thợ sửa ống nước và giúp cô ấy sửa chữa mọi thứ. Tôi yêu thích nghề kỹ thuật cơ khí vì tôi thích chế tạo và sửa chữa đồ vật bằng tay. Tuy nhiên, thời gian đào tạo dài hơn nhiều so với tôi dự kiến, khoảng 2 năm. Đôi khi tôi cảm thấy mệt mỏi vì phải học lý thuyết quá nhiều năm trước khi thực sự bắt đầu đi làm. Dù vậy, tôi tin rằng những kỹ năng mình học được sẽ hữu ích về lâu dài."
      },
      {
        "personIndex": 3,
        "personName": "Person D",
        "contentEn": "After graduating, it took me a long time to find my first job. Many companies required experience, which made the process quite stressful. Luckily, I finally found a position that suits me well in a gaming company. I now work in a flexible working environment where I can manage my own time and work from home, and this helps me balance my work and personal life better.",
        "contentVi": "Sau khi tốt nghiệp, tôi phải mất nhiều thời gian để tìm được công việc đầu tiên. Nhiều công ty yêu cầu kinh nghiệm, điều này khiến quá trình này khá căng thẳng. May mắn thay, cuối cùng tôi đã tìm được một vị trí rất phù hợp với mình tại một công ty trò chơi điện tử. Hiện tại tôi làm việc trong một môi trường làm việc linh hoạt, nơi tôi có thể tự quản lý thời gian của mình và làm việc tại nhà, điều này giúp tôi cân bằng công việc và cuộc sống cá nhân tốt hơn."
      }
    ],
    "questions": [
      {
        "id": 43,
        "questionNumber": 1,
        "question": "Who does not want to change to another job?",
        "correctPersonIndex": 1,
        "explanation": "Đáp án đúng: Person B\n\n📌 Dẫn chứng trích đoạn:\n\"My dream job is becoming a teacher, and I have never thought about changing to another career... without changing my job plans.\"\n-> Dịch: \"Công việc mơ ước của tôi là trở thành giáo viên, và tôi chưa bao giờ nghĩ đến việc chuyển sang nghề khác... mà không thay đổi kế hoạch công việc.\"\n\n💡 Mẹo ghi nhớ cho Person B:\nKhông muốn đổi sang nghề khác (does not want to change to another job / never thought about changing) & Thích vừa làm vừa học/đào tạo (enjoys working while training).",
        "mnemonicHint": "Không muốn đổi nghề khác (not want to change to another job) -> Person B."
      },
      {
        "id": 44,
        "questionNumber": 2,
        "question": "Who thinks their training is too long?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Person C\n\n📌 Dẫn chứng trích đoạn:\n\"However, the training period was much longer than I expected, about 2 years. Sometimes I felt tired of studying theory for so many years before actually starting work.\"\n-> Dịch: \"Tuy nhiên, thời gian đào tạo dài hơn nhiều so với tôi dự kiến, khoảng 2 năm. Đôi khi tôi cảm thấy mệt mỏi vì phải học lý thuyết quá nhiều năm trước khi thực sự đi làm.\"\n\n💡 Mẹo ghi nhớ cho Person C:\nThấy thời gian đào tạo quá dài (training is too long / much longer than I expected, about 2 years) & Thích làm việc bằng tay chân (likes doing things with their hands).",
        "mnemonicHint": "Đào tạo quá dài (training is too long) -> Person C."
      },
      {
        "id": 45,
        "questionNumber": 3,
        "question": "Who enjoys working while training?",
        "correctPersonIndex": 1,
        "explanation": "Đáp án đúng: Person B\n\n📌 Dẫn chứng trích đoạn:\n\"While I am still in training, I also work part-time at a school so that I can gain real teaching experience. I really enjoy working while studying because it helps me improve my skills...\"\n-> Dịch: \"Trong khi vẫn đang trong quá trình đào tạo, tôi cũng làm việc bán thời gian tại trường... Tôi thực sự thích vừa học vừa làm vì nó giúp nâng cao kỹ năng...\"\n\n💡 Mẹo ghi nhớ cho Person B:\nThích vừa làm vừa được đào tạo/học tập (enjoys working while training / while studying).",
        "mnemonicHint": "Thích vừa làm vừa học/đào tạo (enjoys working while training) -> Person B."
      },
      {
        "id": 46,
        "questionNumber": 4,
        "question": "Who enjoys working in a flexible working environment?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Person D\n\n📌 Dẫn chứng trích đoạn:\n\"I now work in a flexible working environment where I can manage my own time and work from home, and this helps me balance my work and personal life better.\"\n-> Dịch: \"Hiện tại tôi làm việc trong một môi trường làm việc linh hoạt, nơi tôi có thể tự quản lý thời gian của mình và làm việc tại nhà...\"\n\n💡 Mẹo ghi nhớ cho Person D:\nThích môi trường làm việc linh hoạt (flexible working environment / manage my own time and work from home) & Thấy khó tìm việc đầu tiên (difficult to get the first job).",
        "mnemonicHint": "Môi trường làm việc linh hoạt (flexible working environment) -> Person D."
      },
      {
        "id": 47,
        "questionNumber": 5,
        "question": "Who thinks it was difficult to get the first job?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Person D\n\n📌 Dẫn chứng trích đoạn:\n\"After graduating, it took me a long time to find my first job. Many companies required experience, which made the process quite stressful.\"\n-> Dịch: \"Sau khi tốt nghiệp, tôi phải mất nhiều thời gian để tìm được công việc đầu tiên. Nhiều công ty yêu cầu kinh nghiệm, điều này khiến quá trình này khá căng thẳng.\"\n\n💡 Mẹo ghi nhớ cho Person D:\nKhó tìm được công việc đầu tiên (difficult to get the first job / took me a long time to find my first job).",
        "mnemonicHint": "Khó tìm việc đầu tiên (difficult to get first job) -> Person D."
      },
      {
        "id": 48,
        "questionNumber": 6,
        "question": "Who thinks they got benefits from working for free?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: Person A\n\n📌 Dẫn chứng trích đoạn:\n\"When I was a student, I decided to do an unpaid internship... I learned a lot of practical skills and gained real working experience... which later helped me find a full-time job more easily.\"\n-> Dịch: \"Khi còn là sinh viên, tôi quyết định thực tập không lương... Tôi đã học được nhiều kỹ năng thực tế, tích lũy kinh nghiệm làm việc thực sự... sau này giúp tôi tìm việc dễ dàng hơn.\"\n\n💡 Mẹo ghi nhớ cho Person A:\nNhận được nhiều lợi ích từ việc làm không lương (benefits from working for free / unpaid internship, didn't earn money).",
        "mnemonicHint": "Lợi ích từ làm việc không công (benefits from working for free) -> Person A."
      },
      {
        "id": 49,
        "questionNumber": 7,
        "question": "Who likes doing things with their hands?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Person C\n\n📌 Dẫn chứng trích đoạn:\n\"I love a career in mechanical engineering because I enjoy making and repairing things by hand.\"\n-> Dịch: \"Tôi yêu thích nghề kỹ thuật cơ khí vì tôi thích chế tạo và sửa chữa đồ vật bằng tay.\"\n\n💡 Mẹo ghi nhớ cho Person C:\nThích làm đồ bằng tay (doing things with their hands / making and repairing things by hand).",
        "mnemonicHint": "Thích làm việc chế tạo bằng tay (doing things with their hands) -> Person C."
      }
    ]
  },
  {
    "id": "topic-8",
    "topicNumber": 8,
    "title": "Music Festival (Lễ hội âm nhạc - Bản 2)",
    "titleVi": "Lễ hội âm nhạc - Bản 2 (Music Festival)",
    "category": "Aptis Reading Part 4",
    "people": [
      "A",
      "B",
      "C",
      "D"
    ],
    "paragraphs": [
      {
        "personIndex": 0,
        "personName": "Person A",
        "contentEn": "This was my first time attending the Music Festival, and to be honest, the weather really didn’t cooperate. It rained heavily on the first two days, which made it difficult to enjoy the outdoor activities. I still got wet in the tent. But I didn’t let that ruin the experience. On the final day, the skies cleared up and the performances were truly amazing — especially the final act in the evening. That last day made it all worthwhile, and I left with some great memories despite the poor weather.",
        "contentVi": "Đây là lần đầu tiên tôi tham dự Lễ hội Âm nhạc, và thành thật mà nói, thời tiết thực sự không ủng hộ chút nào. Trời mưa tầm tã suốt hai ngày đầu tiên, khiến việc tận hưởng các hoạt động ngoài trời trở nên khó khăn. Tôi thậm chí còn bị ướt cả trong lều. Nhưng tôi không để điều đó phá hỏng trải nghiệm của mình. Vào ngày cuối cùng, bầu trời đã quang đãng và các buổi biểu diễn thực sự tuyệt vời — đặc biệt là tiết mục cuối cùng vào buổi tối. Ngày cuối cùng đó đã khiến mọi thứ trở nên hoàn toàn xứng đáng, và tôi ra về với những kỷ niệm tuyệt vời bất chấp thời tiết xấu."
      },
      {
        "personIndex": 1,
        "personName": "Person B",
        "contentEn": "I’ve been to this festival a couple of times in the past, the quality was good the last times I came, but this time is completely different. The sound quality wasn’t great, and the whole event just felt disorganised. There weren’t enough facilities, and the staff didn’t seem prepared to handle the crowd. I couldn’t even interact with the band. I don’t think I’ll be coming back next year. It’s simply not worth the money or the time anymore.",
        "contentVi": "Tôi đã đến lễ hội này một vài lần trong quá khứ, chất lượng những lần trước rất tốt, nhưng lần này thì hoàn toàn khác. Chất lượng âm thanh không tốt, và toàn bộ sự kiện tạo cảm giác vô tổ chức. Không có đủ cơ sở vật chất, và nhân viên dường như chưa sẵn sàng để xử lý đám đông. Tôi thậm chí không thể giao lưu với ban nhạc. Tôi không nghĩ mình sẽ quay lại vào năm tới. Đơn giản là nó không còn đáng tiền hay thời gian nữa."
      },
      {
        "personIndex": 2,
        "personName": "Person C",
        "contentEn": "I really enjoyed the music of this festival and I danced to the music, I felt every second of the festival was worth it. I absolutely loved the energy of the performances, and the music was spot on throughout the weekend. However, I have to say the ticket prices were far too high, especially for students. I paid almost double what I did two years ago, and although I enjoyed the music, I’m not sure it offered good value for money. If they don’t lower the prices next year, a lot of people might skip it.",
        "contentVi": "Tôi thực sự rất thích âm nhạc của lễ hội này và tôi đã nhảy theo điệu nhạc, tôi cảm thấy từng giây từng phút của lễ hội đều rất đáng giá. Tôi hoàn toàn yêu thích năng lượng từ các màn trình diễn, và âm nhạc rất tuyệt vời trong suốt cả dịp cuối tuần. Tuy nhiên, tôi phải nói rằng giá vé quá cao, đặc biệt là đối với sinh viên. Tôi đã phải trả gần gấp đôi so với hai năm trước, và mặc dù thích âm nhạc, tôi không chắc nó có tương xứng với số tiền bỏ ra hay không. Nếu họ không giảm giá vào năm tới, rất nhiều người có thể sẽ bỏ qua không tham gia."
      },
      {
        "personIndex": 3,
        "personName": "Person D",
        "contentEn": "We were playing in a band and we finished our performance in the morning. However, I stayed at the festival to meet up with some old band mates. We talked a lot. However, I didn’t like the venue. It was too crowded and not well organised. The road to the tent village was also congested. I think they should choose a better location next year.",
        "contentVi": "Chúng tôi biểu diễn trong một ban nhạc và đã hoàn thành phần trình diễn của mình vào buổi sáng. Tuy nhiên, tôi vẫn ở lại lễ hội để gặp gỡ một số bạn cũ trong ban nhạc trước đây. Chúng tôi đã trò chuyện rất nhiều. Tuy vậy, tôi không thích địa điểm tổ chức. Nó quá đông đúc và không được tổ chức tốt. Con đường dẫn đến khu lều trại cũng bị tắc nghẽn. Tôi nghĩ họ nên chọn một địa điểm tốt hơn vào năm tới."
      }
    ],
    "questions": [
      {
        "id": 50,
        "questionNumber": 1,
        "question": "Who disappointed with the festival?",
        "correctPersonIndex": 1,
        "explanation": "Đáp án đúng: Person B (B)\n\n📌 Dẫn chứng trích đoạn:\n\"The sound quality wasn't great, and the whole event just felt disorganised... I don't think I'll be coming back next year. It's simply not worth the money or the time anymore.\"\n-> Dịch: \"Chất lượng âm thanh không tốt, toàn bộ sự kiện tạo cảm giác vô tổ chức... Tôi không nghĩ mình sẽ quay lại vào năm tới. Đơn giản là nó không còn đáng tiền hay thời gian nữa.\"\n\n💡 Mẹo ghi nhớ cho Person B:\nThất vọng với lễ hội (disappointed with the festival / disorganised / not worth money or time).",
        "mnemonicHint": "Thất vọng về lễ hội (disappointed with festival) -> Person B."
      },
      {
        "id": 51,
        "questionNumber": 2,
        "question": "Who didn’t like the venue?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Person D (D)\n\n📌 Dẫn chứng trích đoạn:\n\"However, I didn't like the venue. It was too crowded and not well organised. The road to the tent village was also congested. I think they should choose a better location next year.\"\n-> Dịch: \"Tuy nhiên, tôi không thích địa điểm tổ chức. Nó quá đông đúc và không được tổ chức tốt... Tôi nghĩ họ nên chọn một địa điểm tốt hơn vào năm tới.\"\n\n💡 Mẹo ghi nhớ cho Person D:\nKhông thích địa điểm tổ chức (didn't like the venue / choose a better location next year) & Thích gặp lại bạn cũ (liked to meet old friends / old band mates).",
        "mnemonicHint": "Không thích địa điểm (didn't like the venue) -> Person D."
      },
      {
        "id": 52,
        "questionNumber": 3,
        "question": "Who found the ticket prices expensive?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Person C (C)\n\n📌 Dẫn chứng trích đoạn:\n\"However, I have to say the ticket prices were far too high, especially for students. I paid almost double what I did two years ago...\"\n-> Dịch: \"Tuy nhiên, tôi phải nói rằng giá vé quá cao, đặc biệt là đối với sinh viên. Tôi đã phải trả gần gấp đôi so với hai năm trước...\"\n\n💡 Mẹo ghi nhớ cho Person C:\nThấy giá vé đắt đỏ (found the ticket prices expensive / ticket prices were far too high) & Thích âm nhạc tại sự kiện (enjoyed the music at the event).",
        "mnemonicHint": "Chê giá vé đắt (ticket prices expensive) -> Person C."
      },
      {
        "id": 53,
        "questionNumber": 4,
        "question": "Who enjoyed the last day?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: Person A (A)\n\n📌 Dẫn chứng trích đoạn:\n\"On the final day, the skies cleared up and the performances were truly amazing — especially the final act in the evening. That last day made it all worthwhile...\"\n-> Dịch: \"Vào ngày cuối cùng, bầu trời đã quang đãng và các buổi biểu diễn thực sự tuyệt vời... Ngày cuối cùng đó đã khiến mọi thứ trở nên hoàn toàn xứng đáng...\"\n\n💡 Mẹo ghi nhớ cho Person A:\nThích ngày cuối cùng (enjoyed the last day / final day made it all worthwhile) & Không thích thời tiết xấu (disliked the bad weather / rained heavily).",
        "mnemonicHint": "Thích ngày cuối cùng (enjoyed the last day) -> Person A."
      },
      {
        "id": 54,
        "questionNumber": 5,
        "question": "Who liked to meet old friends?",
        "correctPersonIndex": 3,
        "explanation": "Đáp án đúng: Person D (D)\n\n📌 Dẫn chứng trích đoạn:\n\"However, I stayed at the festival to meet up with some old band mates. We talked a lot.\"\n-> Dịch: \"Tuy nhiên, tôi vẫn ở lại lễ hội để gặp gỡ một số bạn cũ trong ban nhạc trước đây. Chúng tôi đã trò chuyện rất nhiều.\"\n\n💡 Mẹo ghi nhớ cho Person D:\nThích gặp lại bạn cũ (liked to meet old friends / meet up with some old band mates) & Không thích địa điểm (didn't like the venue).",
        "mnemonicHint": "Thích gặp lại bạn cũ (meet old friends) -> Person D."
      },
      {
        "id": 55,
        "questionNumber": 6,
        "question": "Who disliked the bad weather?",
        "correctPersonIndex": 0,
        "explanation": "Đáp án đúng: Person A (A)\n\n📌 Dẫn chứng trích đoạn:\n\"and to be honest, the weather really didn't cooperate. It rained heavily on the first two days, which made it difficult to enjoy the outdoor activities. I still got wet in the tent.\"\n-> Dịch: \"và thành thật mà nói, thời tiết thực sự không ủng hộ chút nào. Trời mưa tầm tã suốt hai ngày đầu tiên... Tôi thậm chí còn bị ướt cả trong lều.\"\n\n💡 Mẹo ghi nhớ cho Person A:\nKhông thích thời tiết xấu (disliked the bad weather / rained heavily, poor weather) & Thích ngày cuối cùng (enjoyed the last day).",
        "mnemonicHint": "Không thích thời tiết xấu, mưa ướt lều (disliked the bad weather) -> Person A."
      },
      {
        "id": 56,
        "questionNumber": 7,
        "question": "Who enjoyed the music at the event?",
        "correctPersonIndex": 2,
        "explanation": "Đáp án đúng: Person C (C)\n\n📌 Dẫn chứng trích đoạn:\n\"I really enjoyed the music of this festival and I danced to the music, I felt every second of the festival was worth it. I absolutely loved the energy of the performances, and the music was spot on throughout the weekend.\"\n-> Dịch: \"Tôi thực sự rất thích âm nhạc của lễ hội này và tôi đã nhảy theo điệu nhạc, tôi cảm thấy từng giây từng phút của lễ hội đều rất đáng giá. Tôi hoàn toàn yêu thích năng lượng từ các màn trình diễn, và âm nhạc rất tuyệt vời...\"\n\n💡 Mẹo ghi nhớ cho Person C:\nThích âm nhạc tại sự kiện (enjoyed the music at the event / danced to the music, music was spot on) & Chê giá vé đắt (found the ticket prices expensive).",
        "mnemonicHint": "Thích âm nhạc, nhảy theo nhạc (enjoyed the music at the event) -> Person C."
      }
    ]
  }
];
