import { GoogleGenAI } from "@google/genai";
import { UserInputs } from "../types";
import { IMAGE_STYLE_MAPPING, VOICE_TONE_MAPPING } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateLalaPrompts(inputs: UserInputs): Promise<{ characterPrompt?: string; imagePrompts: string[]; videoPrompts: string[] }> {
  const mappedImageStyle = IMAGE_STYLE_MAPPING[inputs.imageStyle] || inputs.imageStyle;
  const mappedCharStyle = inputs.charImageStyle ? (IMAGE_STYLE_MAPPING[inputs.charImageStyle] || inputs.charImageStyle) : mappedImageStyle;
  const mappedVoiceTone = VOICE_TONE_MAPPING[inputs.voiceTone] || inputs.voiceTone;

  const prompt = `
Bạn là một chuyên gia viết câu lệnh (prompt engineering) cho AI tạo ảnh (như Midjourney) và AI tạo video (như Sora, Kling, Luma).
Hãy tạo bộ câu lệnh cho nhân vật Capybara tên là Lala trong bối cảnh nông trại đời thật.

THÔNG TIN ĐẦU VÀO:
- Món ăn/Thức uống: ${inputs.food}
- Nguyên liệu chính: ${inputs.mainIngredient || 'AI tự suy luận dựa trên món ăn'}
- Môi trường: ${inputs.environment}
- Phong cách hình ảnh: ${mappedImageStyle}
- Số lượng cảnh: ${inputs.videoCount}
- Tỷ lệ khung hình: ${inputs.aspectRatio}
- Ngôn ngữ voice: ${inputs.voiceLanguage}
- Giọng voice: ${mappedVoiceTone}
- Mức độ chi tiết hành động: ${inputs.actionDetail}

${inputs.enableCharImage ? `
YÊU CẦU TẠO ẢNH NHÂN VẬT THAM CHIẾU:
- Vóc dáng: ${inputs.bodyShape}
- Phụ kiện đầu: ${inputs.headAccessory}
- Phụ kiện thêm: ${inputs.extraAccessory}
- Biểu cảm: ${inputs.expression}
- Tư thế: ${inputs.pose}
- Màu lông: ${inputs.furColor}
- Phong cách: ${mappedCharStyle}
` : ''}

QUY TẮC CHUNG:
1. Tất cả câu lệnh viết bằng tiếng Anh.
2. Không đánh số thứ tự, không giải thích thừa.
3. Mỗi cảnh sinh ra 2 loại câu lệnh song song: 1 CÂU LỆNH ẢNH và 1 CÂU LỆNH VIDEO.
4. Số lượng câu lệnh ảnh phải khớp với số lượng câu lệnh video (${inputs.videoCount}).
5. Hai loại câu lệnh phải đồng bộ cùng bối cảnh, đạo cụ, nhân vật, logic cảnh.

QUY TẮC PHONG CÁCH [style] (BẮT BUỘC):
- Chỉ ghi đúng phong cách đã chọn, không viết dài dòng.
- Nếu chọn "hoạt hình 3D điện ảnh": [style] stylized 3D animated film render, cinematic animated movie look
- Nếu chọn "ảnh thật": [style] photorealistic, cinematic real-life look
- Nếu chọn "nông trại đời thật": [style] realistic farm-life style, natural countryside look
- Nếu chọn "đồng quê ấm cúng": [style] cozy countryside style, warm rustic look
- Nếu chọn "hoàng hôn ấm": [style] warm sunset cinematic look
- Nếu chọn "nắng sớm dịu": [style] soft morning light, fresh natural look

QUY TẮC CÂU LỆNH ẢNH THAM CHIẾU (Nếu bật):
- KHÔNG dùng tên "Lala". Gọi là "cute capybara character reference".
- Format: [style] . [main char] . [appearance] . [background] pure white background . [expression] . [negative]
- [negative]: no text, no watermark, no logo, no subtitles

QUY TẮC CÂU LỆNH ẢNH (IMAGE PROMPT):
- Mục tiêu: Tạo ra hình ảnh tĩnh đúng và đẹp, làm nền cho video.
- Nội dung: Tập trung mô tả phong cách, nhân vật / đối tượng chính, môi trường, bố cục, đạo cụ, chi tiết thực vật.
- [main char]: Luôn luôn chỉ gọi tên là "Lala". KHÔNG mô tả lại ngoại hình (màu lông, vóc dáng, biểu cảm chi tiết) của Lala trong phần này nữa. Chỉ cần ghi "Lala" và hành động/vị trí của cô ấy trong cảnh.
- KHÔNG có [voice], KHÔNG mô tả lip sync, KHÔNG mô tả chuyển động dài dòng.
- BẮT BUỘC: Giữ nguyên cấu trúc nhãn trong dấu [ ]. Không được biến thành đoạn văn thuần.
- Format: [style] ... . [main char] ... . [environment] ... . [details] ... . [camera] ... . [negative] ...
- Ví dụ đúng: [style] stylized 3D animated film render, cinematic animated movie look . [main char] Lala standing beside a mango tree with subtle anthropomorphic eyes and a small mouth integrated into the trunk . [environment] lush countryside mango orchard, warm morning sunlight, green foliage . [details] a woven basket on the grass, ripe yellow mangoes hanging naturally from branches . [camera] medium shot, eye-level, 9:16 aspect ratio . [negative] no text, no watermark, no logo, no subtitles

QUY TẮC CÂU LỆNH VIDEO (VIDEO PROMPT):
- Mục tiêu: Mô tả chuyển động, hành động và âm thanh dựa trên cảnh của câu lệnh ảnh.
- Nội dung: Tập trung vào hành động nhân vật, lip sync, tương tác, nhịp cảnh 8 giây.
- BẮT BUỘC có [voice] (trừ khi người dùng chọn không thoại).
- KHÔNG dùng nhãn [main char].
- QUY TẮC ĐẶT TÊN: Trong toàn bộ câu lệnh video, KHÔNG dùng tên "Lala". Phải thay bằng "capybara" (viết thường trong mô tả hành động, viết hoa "Capybara:" trong nhãn người nói).
- ĐỘ DÀI VÀ CHI TIẾT (QUAN TRỌNG):
  + Cảnh 1: Ngắn gọn vì là cảnh mở đầu.
  + Từ cảnh 2 trở đi: Phải viết DÀI và CHI TIẾT hơn (tăng 30-60% độ dài). Cần đủ thông tin hành động, thao tác, nhịp chuyển động và lời nói phù hợp cho clip 8 giây.
- BẮT BUỘC: Giữ nguyên cấu trúc nhãn trong dấu [ ]. Không được biến thành đoạn văn thuần.
- Format: [style] ... . [environment] ... . [action] ... . [props] ... . [camera] ... . [voice] ... . [negative] ...
- Ví dụ đúng (Cảnh 2+): [style] stylized 3D animated film render, cinematic animated movie look . [environment] lush countryside mango orchard, warm morning sunlight, green foliage . [action] capybara slowly stirs the coconut milk and sugar mixture in the pot with steady circular motion, watching the liquid turn smoother and slightly thicker as the steam rises gently . [props] woven basket on the grass, ripe mangoes hanging from branches . [camera] medium shot, eye-level, 9:16 aspect ratio . [voice] warm gentle male voice: Capybara: "Bây giờ capy khuấy đều tay cho nước cốt dừa với đường tan hết nha, đun nhỏ lửa vậy thì hỗn hợp sẽ thơm béo hơn đó." . [negative] no text, no watermark, no logo, no subtitles

QUY TẮC VOICE (QUAN TRỌNG):
- Luôn gồm 2 phần: [mô tả giọng nói] và [nội dung lời thoại].
- Nhãn người nói của nhân vật chính trong video phải luôn là: "Capybara:".
- KHÔNG dùng: "Lala:", "Capy:", "Lala the capybara:".
- Nội dung lời thoại bên trong: Nhân vật chính xưng hô là "capy".
- KHÔNG BAO GIỜ tự xưng là "Lala" hoặc dùng từ "capybara" trong nội dung lời thoại.
- ĐỘ DÀI LỜI THOẠI: Phù hợp cho video 8 giây. Từ cảnh 2 trở đi nên là 1 câu dài vừa phải hoặc câu hoàn chỉnh, đủ nhịp cho 7-8 giây nói.

QUY TẮC VOICE CHI TIẾT THEO CẢNH:
1. CẢNH 1 (Hội thoại đa dạng):
- BẮT BUỘC là hội thoại giữa Capybara và nhân vật thực vật nhân hóa.
- Phải đa dạng nội dung, không lặp lại mẫu "xin - cho" đơn điệu.
- Các nhóm hội thoại gợi ý:
  + Nhóm 1: Chào hỏi + xin nguyên liệu làm món.
  + Nhóm 2: Hỏi thăm + cây gợi ý quả chín/ngon nhất.
  + Nhóm 3: Capybara thông báo món sắp làm + cây hưởng ứng/góp ý.
  + Nhóm 4: Cây chủ động mời Capybara lấy nguyên liệu.
  + Nhóm 5: Cây hỏi Capybara đi đâu + Capybara trả lời đang đi nấu ăn.
  + Nhóm 6: Cây góp mẹo nấu ăn (ví dụ: "lấy quả này thịt dẻo hơn đó").
  + Nhóm 7: Nói chuyện vui vẻ, đáng yêu, đôi khi nhân vật cây có thể hơi đanh đá một chút.
- Lời thoại phải hợp tính cách nguyên liệu và logic món ăn.

2. TỪ CẢNH 2 TRỞ ĐI (Hướng dẫn nấu ăn/Tutorial):
- Capybara đóng vai trò người dẫn quy trình nấu ăn (tutorial guide).
- [action] CHI TIẾT: Mô tả rõ thao tác đang diễn ra, nhịp chuyển động của tay/dụng cụ, sự biến đổi của nguyên liệu (ví dụ: tan chảy, sánh lại, đổi màu) và cảm giác tự nhiên của cảnh.
- [voice] DÀI VỪA PHẢI: Thoại phải bám sát các bước chế biến thực tế của món ${inputs.food}. Lời thoại nghe như đang hướng dẫn làm món thật, đủ nhịp cho clip 8 giây (không quá ngắn kiểu 4-6 từ, không quá dài thành nhiều câu phức tạp).
- Mỗi cảnh nói đúng bước đang diễn ra. Không nói lan man ngoài nội dung món ăn.

QUY TẮC NHÂN HÓA (CẢNH 1):
- Cảnh 1 BẮT BUỘC có Lala và nhân vật thực vật nhân hóa.
- Phải tự nhận diện nhóm thực vật để mô tả đúng cấu trúc sinh học TRƯỚC khi nhân hóa.
- Giữ đúng cấu trúc cây thật. Chỉ có mắt và miệng nhỏ tích hợp vào thân/quả. KHÔNG tay, KHÔNG chân, KHÔNG thân người.
- Lip sync: Lala có lip sync mạnh mẽ (strong visible lip sync). Nhân vật cây có chuyển động miệng nhẹ.

QUY TẮC MÔI TRƯỜNG (ENVIRONMENT CONTINUITY):
- [environment]: Phải mô tả đúng môi trường thật của nhóm thực vật đó.
- Từ cảnh 2 trở đi, dùng logic "same environment continuity" để đồng bộ bối cảnh.

QUY TẮC CONTINUITY TRẠNG THÁI (QUAN TRỌNG):
- Tất cả câu lệnh ảnh và video phải bám theo một chuỗi trạng thái chế biến liên tục của món ${inputs.food}.
- Cảnh sau phải kế thừa đúng trạng thái của cảnh trước. Tuyệt đối KHÔNG quay ngược lại trạng thái cũ (ví dụ: đã gọt vỏ thì cảnh sau không được còn vỏ, đã cắt lát thì không được quay lại nguyên trái).
- Trạng thái nguyên liệu và món ăn phải nối tiếp nhau logic: Nguyên liệu thô -> Sơ chế (gọt, cắt) -> Chế biến (nấu, xay, trộn) -> Thành phẩm -> Trình bày.
- Đạo cụ và môi trường phải hợp lý theo bước hiện tại:
  + Bước sơ chế: Dao, thớt, tô, rổ.
  + Bước nấu: Nồi, chảo, bếp, muỗng khuấy.
  + Bước trình bày: Ly, bát, đĩa, topping.
- Ảnh và video của cùng một cảnh phải mô tả CÙNG MỘT trạng thái nguyên liệu.
- Trước khi viết, hãy xác định toàn bộ quy trình chế biến và chia thành ${inputs.videoCount} trạng thái tuần tự.

HÃY TRẢ VỀ KẾT QUẢ THEO ĐỊNH DẠNG JSON SAU:
{
  "characterPrompt": "câu lệnh ảnh tham chiếu",
  "imagePrompts": ["câu lệnh ảnh cảnh 1", "câu lệnh ảnh cảnh 2", ...],
  "videoPrompts": ["câu lệnh video cảnh 1", "câu lệnh video cảnh 2", ...]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    throw new Error("Không thể phân tích kết quả từ AI.");
  } catch (error) {
    console.error("Error generating prompts:", error);
    throw error;
  }
}

export async function generateLalaImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Không tìm thấy dữ liệu ảnh trong phản hồi từ AI.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
