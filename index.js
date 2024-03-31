import express from 'express';
import Replicate from 'replicate';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();

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
        "lucataco/juggernaut-xl-v9:bea09cf018e513cef0841719559ea86d2299e05448633ac8fe270b5d5cd6777e",
        {
          input: {
            width: 1024,
            height: 1400,
            prompt: prompt,
            scheduler: "DPM++SDE",
            num_outputs: 1,
            guidance_scale: 2,
            apply_watermark: true,
            negative_prompt: "",
            num_inference_steps: 5
          }
        }
      );
      
      // 渲染结果页面,传入生成的图片URL
      res.render('result', { imageUrl: output[0] });
    } catch (error) {
      console.error('Error generating image:', error);
      res.status(500).send('Error generating image. Please try again later.');
    }
  });

// 启动服务器
app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running...');
});
