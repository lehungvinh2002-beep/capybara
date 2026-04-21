import { GoogleGenAI } from "@google/genai";
import { UserInputs } from "../types";
import { IMAGE_STYLE_MAPPING, VOICE_TONE_MAPPING } from "../constants";

function getAI() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Thiếu VITE_GEMINI_API_KEY. Hãy kiểm tra GitHub Actions và secret.");
  }

  return new GoogleGenAI({ apiKey });
}

export async function generateLalaPrompts(
  inputs: UserInputs
): Promise<{ characterPrompt?: string; imagePrompts: string[]; videoPrompts: string[] }> {
  const mappedImageStyle = IMAGE_STYLE_MAPPING[inputs.imageStyle] || inputs.imageStyle;
  const mappedCharStyle = inputs.charImageStyle
    ? IMAGE_STYLE_MAPPING[inputs.charImageStyle] || inputs.charImageStyle
    : mappedImageStyle;
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
- [negative]&#58; no text, no watermark, no logo, no subtitles

QUY TẮC CÂU LỆNH ẢNH (IMAGE PROMPT):
- Mục tiêu: Tạo ra hình ảnh tĩnh đúng và đẹp, làm nền cho video.
- Nội dung: Tập trung mô tả phong cách, nhân vật / đối tượng chính, môi trường, bố cục, đạo cụ, chi tiết thực vật.
- [main char]&#58; Luôn luôn chỉ gọi tên là "Lala". KHÔNG mô tả lại ngoại hình của Lala trong phần này nữa. Chỉ cần ghi "Lala" và hành động/vị trí của cô ấy trong cảnh.
- KHÔNG có [voice], KHÔNG mô tả lip sync, KHÔNG mô tả chuyển động dài dòng.
- BẮT BUỘC: Giữ nguyên cấu trúc nhãn trong dấu [ ].
- Format: [style] ... . [main char] ... . [environment] ... . [details] ... . [camera] ... . [negative] ...

QUY TẮC CÂU LỆNH VIDEO (VIDEO PROMPT):
- Mục tiêu: Mô tả chuyển động, hành động và âm thanh dựa trên cảnh của câu lệnh ảnh.
- Nội dung: Tập trung vào hành động nhân vật, lip sync, tương tác, nhịp cảnh 8 giây.
- BẮT BUỘC có [voice] (trừ khi người dùng chọn không thoại).
- KHÔNG dùng nhãn [main char].
- QUY TẮC ĐẶT TÊN: Trong toàn bộ câu lệnh video, KHÔNG dùng tên "Lala". Phải thay bằng "capybara".
- Cảnh 1 ngắn gọn hơn. Từ cảnh 2 trở đi phải dài và chi tiết hơn.
- Format: [style] ... . [environment] ... . [action] ... . [props] ... . [camera] ... . [voice] ... . [negative] ...

QUY TẮC VOICE:
- Nhãn người nói luôn là: "Capybara:"
- Nội dung lời thoại bên trong: nhân vật chính xưng hô là "capy"
- KHÔNG BAO GIỜ tự xưng là "Lala"

QUY TẮC CONTINUITY:
- Tất cả câu lệnh ảnh và video phải bám theo một chuỗi trạng thái chế biến liên tục của món ${inputs.food}.
- Cảnh sau phải kế thừa đúng trạng thái của cảnh trước.
- Trạng thái nguyên liệu và món ăn phải nối tiếp nhau logic.
- Trước khi viết, hãy xác định toàn bộ quy trình chế biến và chia thành ${inputs.videoCount} trạng thái tuần tự.

HÃY TRẢ VỀ KẾT QUẢ THEO ĐỊNH DẠNG JSON SAU:
{
  "characterPrompt": "câu lệnh ảnh tham chiếu",
  "imagePrompts": ["câu lệnh ảnh cảnh 1", "câu lệnh ảnh cảnh 2"],
  "videoPrompts": ["câu lệnh video cảnh 1", "câu lệnh video cảnh 2"]
}
`;

  try {
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("AI không trả về nội dung.");
    }

    return JSON.parse(text);
  } catch (error: any) {
    console.error("Error generating prompts:", error);
    throw new Error(error?.message || "Lỗi tạo câu lệnh từ Gemini.");
  }
}

export async function generateLalaImage(prompt: string): Promise<string> {
  try {
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if ((part as any).inlineData) {
        return `data:image/png;base64,${(part as any).inlineData.data}`;
      }
    }

    throw new Error("Không tìm thấy dữ liệu ảnh trong phản hồi từ AI.");
  } catch (error: any) {
    console.error("Error generating image:", error);
    throw new Error(error?.message || "Lỗi tạo ảnh từ Gemini.");
  }
}
