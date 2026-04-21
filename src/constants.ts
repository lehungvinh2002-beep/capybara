export const IMAGE_STYLE_MAPPING: Record<string, string> = {
  "ảnh thật": "photorealistic, cinematic real-life look",
  "điện ảnh": "cinematic, dramatic lighting, film look",
  "nông trại đời thật": "realistic farm-life style, natural countryside look",
  "đồng quê ấm cúng": "cozy countryside style, warm rustic look",
  "hoàng hôn ấm": "warm sunset cinematic look",
  "nắng sớm dịu": "soft morning light, fresh natural look",
  "hoạt hình 3D điện ảnh": "stylized 3D animated film render, cinematic animated movie look"
};

export const VOICE_TONE_MAPPING: Record<string, string> = {
  "nam hiền hòa ấm áp": "warm gentle male voice",
  "nữ miền Bắc nhẹ nhàng": "soft Northern Vietnamese female voice",
  "nữ trung tính ấm áp": "warm neutral female voice",
  "nam trầm chậm rãi": "deep calm male voice, slow and steady delivery",
  "trẻ em vui vẻ": "cheerful childlike voice",
  "không có thoại": "ambience only"
};

export const IMAGE_STYLE_OPTIONS = Object.keys(IMAGE_STYLE_MAPPING);
