export const getFakeContentByCategory = (slug: string): string => {
    switch (slug) {
        case 'politics':
            return `
Trong bối cảnh toàn cầu đang thay đổi nhanh chóng, chính phủ đã công bố một loạt chính sách cải cách nhằm thúc đẩy phát triển bền vững và tăng cường minh bạch trong hoạt động công vụ. Một trong những điểm nhấn là việc áp dụng công nghệ số trong quản lý hành chính, giúp giảm thiểu thời gian xử lý hồ sơ và nâng cao sự hài lòng của người dân. Đồng thời, các bộ ngành cũng được yêu cầu tăng cường đối thoại với người dân để xây dựng chính sách sát thực tế hơn.

Ngoài ra, việc đẩy mạnh hợp tác quốc tế trong lĩnh vực an ninh, kinh tế và môi trường cũng được xem là ưu tiên hàng đầu. Chính phủ cam kết tiếp tục lắng nghe ý kiến của mọi tầng lớp nhân dân để đưa ra những chính sách phù hợp và hiệu quả nhất.
`;

        case 'science':
            return `
Một nhóm các nhà khoa học tại Đại học Quốc gia đã công bố một nghiên cứu mới cho thấy khả năng ứng dụng tế bào gốc trong việc chữa trị các bệnh mãn tính như tiểu đường và Parkinson. Đây là kết quả của gần một thập kỷ nghiên cứu không ngừng nghỉ trong lĩnh vực y học tái tạo. 

Công nghệ này hoạt động bằng cách sử dụng tế bào gốc đã được lập trình lại để phát triển thành các mô khỏe mạnh thay thế cho các mô bị tổn thương. Các thử nghiệm lâm sàng ban đầu cho kết quả đầy hứa hẹn, với tỷ lệ phục hồi chức năng ở bệnh nhân đạt đến 80%.

Nếu thành công, đây sẽ là bước ngoặt trong lĩnh vực y học hiện đại, mở ra tương lai điều trị các bệnh nan y một cách hiệu quả và ít xâm lấn hơn phương pháp truyền thống.
`;

        case 'entertainment':
            return `
Sau nhiều tháng chờ đợi, bộ phim điện ảnh "Ký Ức Lặng Thầm" chính thức công chiếu và nhanh chóng gây sốt trên các nền tảng mạng xã hội. Với sự tham gia của dàn diễn viên thực lực cùng kịch bản được đầu tư kỹ lưỡng, phim mang đến những cảm xúc chân thật, lay động lòng người.

Không chỉ dừng lại ở yếu tố giải trí, bộ phim còn lồng ghép thông điệp về gia đình, ký ức tuổi thơ và sự tha thứ, khiến khán giả phải suy ngẫm. Nhiều khán giả chia sẻ rằng họ đã rơi nước mắt khi xem những phân cảnh cuối cùng, đặc biệt là phần âm nhạc được phối khí tinh tế, góp phần tạo nên không khí lắng đọng cho phim.

Hiện tại, "Ký Ức Lặng Thầm" đang dẫn đầu doanh thu phòng vé và được kỳ vọng sẽ trở thành một trong những bộ phim Việt Nam thành công nhất năm nay.
`;

        case 'sports':
            return `
Trong trận đấu tâm điểm tối qua giữa đội tuyển Việt Nam và Thái Lan, người hâm mộ đã được chứng kiến một màn trình diễn kịch tính đến phút cuối cùng. Sau hiệp một cân bằng, đội tuyển Việt Nam bất ngờ tăng tốc và ghi bàn mở tỷ số ở phút 68 nhờ pha dứt điểm tinh tế của tiền đạo Văn Toàn.

Không chỉ có chiến thắng, trận đấu còn ghi nhận sự tiến bộ rõ rệt về lối chơi của đội tuyển, đặc biệt là khả năng kiểm soát bóng và chuyển trạng thái nhanh. Hàng thủ thi đấu chắc chắn trong khi tuyến giữa hoạt động hiệu quả giúp giữ nhịp trận đấu ổn định.

Chiến thắng này giúp đội tuyển Việt Nam vươn lên vị trí dẫn đầu bảng và mở ra cơ hội lớn để giành vé vào vòng loại cuối cùng World Cup khu vực châu Á.
`;

        case 'technology':
            return `
Tập đoàn công nghệ hàng đầu vừa ra mắt dòng điện thoại thông minh thế hệ mới tích hợp trí tuệ nhân tạo, giúp cá nhân hóa trải nghiệm người dùng ở mức tối đa. Với khả năng nhận diện giọng nói chính xác, tối ưu hoá pin thông minh và camera sử dụng thuật toán AI để xử lý hình ảnh, thiết bị này hứa hẹn tạo nên cuộc cách mạng trong ngành công nghiệp điện thoại.

Điểm đặc biệt là khả năng kết nối không dây siêu tốc độ, chỉ mất chưa đến 2 giây để truyền tải video 4K từ điện thoại lên TV. Ngoài ra, công nghệ bảo mật sinh trắc học đa lớp giúp tăng cường an toàn cho dữ liệu cá nhân trong thời đại số hóa hiện nay.

Giới công nghệ đánh giá đây là bước đi táo bạo và mang tính đột phá, không chỉ ở thị trường trong nước mà còn cạnh tranh trực tiếp với các ông lớn toàn cầu.
`;

        case 'business':
            return `
Thị trường tài chính trong nước vừa có một tuần biến động mạnh khi VN-Index vượt mốc 1300 điểm lần đầu tiên sau 18 tháng. Điều này được thúc đẩy bởi dòng vốn ngoại tăng mạnh và kỳ vọng lãi suất tiếp tục duy trì ở mức thấp, tạo động lực cho các doanh nghiệp phục hồi sau đại dịch.

Các ngành nổi bật trong tuần qua bao gồm công nghệ, bất động sản và năng lượng tái tạo, với nhiều mã cổ phiếu đạt mức tăng trưởng ấn tượng. Đặc biệt, các doanh nghiệp có chiến lược chuyển đổi số mạnh mẽ đang thu hút sự chú ý của nhà đầu tư.

Tuy nhiên, các chuyên gia cũng cảnh báo nhà đầu tư cần tỉnh táo trước biến động quốc tế và rủi ro từ chính sách tiền tệ toàn cầu, nhằm đảm bảo chiến lược đầu tư bền vững dài hạn.
`;

        default:
            return `

Trong thế giới hiện đại, thông tin luôn thay đổi từng giờ từng phút. Với mong muốn giúp bạn tiết kiệm thời gian nhưng vẫn tiếp cận được những tin tức chính xác, hữu ích và cập nhật nhất, chúng tôi đã xây dựng nền tảng này như một trợ lý tin tức cá nhân dành riêng cho bạn.

Tại đây, bạn sẽ tìm thấy những bài viết nổi bật thuộc nhiều lĩnh vực: từ chính trị – nơi các quyết định có thể thay đổi cả quốc gia; đến khoa học – nơi từng phát hiện có thể định hình tương lai; giải trí – nơi cảm xúc được thăng hoa; thể thao – nơi tinh thần cạnh tranh và niềm tự hào dân tộc luôn hiện diện; công nghệ – nơi các tiến bộ mới mở ra kỷ nguyên sống số; và kinh doanh – nơi các biến động tài chính ảnh hưởng đến cuộc sống hàng ngày của mỗi người.

Bạn có thể chọn chuyên mục phù hợp với sở thích, hoặc đơn giản là lướt xem các nội dung đang được nhiều người quan tâm. Hành trình khám phá tin tức của bạn bắt đầu từ đây – hãy để chúng tôi đồng hành cùng bạn mỗi ngày, với những dòng tin đáng đọc nhất.
`;
    }
}
