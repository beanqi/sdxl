import express from 'express';
import Replicate from 'replicate';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const deepLAuthKey = process.env.DEEPL_KEY;


// 设置模板引擎为EJS
app.set('view engine', 'ejs');

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 设置视图文件的目录
app.set('views', __dirname + '/views');

// 创建Replicate实例
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 首页路由
app.get('/', (req, res) => {
  res.render('index');
});

// 处理画图请求
app.get('/generate', async (req, res) => {
    const prompt = req.query.prompt;
    
    try {
      // 调用Replicate API生成图片
      const output = await replicate.run(
        "asiryan/juggernaut-xl-v7:6a52feace43ce1f6bbc2cdabfc68423cb2319d7444a1a1dae529c5e88b976382",
        {
          input: {
            seed: 29725,
            width: 1024,
            height: 1600,
            prompt: translatePrompt(prompt),
            strength: 1,
            scheduler: "K_EULER_ANCESTRAL",
            num_outputs: 1,
            guidance_scale: 7,
            negative_prompt: "(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate, (airbrushed, cartoon, anime, semi-realistic, cgi, render, blender, digital art, manga, amateur:1.3), (3D ,3D Game, 3D Game Scene, 3D Character:1.1), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3)",
            num_inference_steps: 18
          }
        }
      );
      
      // 渲染结果页面,传入生成的图片URL
      res.render('result', { imageUrl: output[0] });
    } catch (error) {
      console.error('Error generating image:', error);
      res.status(500).send('由于道德审查，画图失败，请返回重试.');
    }
  });

// 启动服务器
app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running...');
});


async function translatePrompt(originalPrompt) {
  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${deepLAuthKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: originalPrompt,
        target_lang: 'EN'
      })
    });

    const data = await response.json();
    console.log('Translated prompt:', data.translations[0].text);
    if (data.translations && data.translations.length > 0) {
      return data.translations[0].text; // Return the translated text
    } else {
      throw new Error('No translation found');
    }
  } catch (error) {
    console.error('Error translating prompt:', error);
    throw error; // Rethrow the error to handle it in the calling context
  }
}