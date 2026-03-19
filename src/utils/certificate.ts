import type { LevelName } from '../constants/levels';

// Expo Print safe: inline styles + system fonts only.
export const certificateHTML = (name: string, score: number, level: LevelName, certId: string, date: string) => `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background:#0C0C0C;color:#F5F0E8;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <div style="padding:48px;">
      <div style="border:1px solid #C8B89A;padding:40px;">
        <div style="text-align:center;">
          <div style="letter-spacing:8px;font-size:20px;font-weight:300;">CARBON27</div>
          <div style="height:24px;"></div>
          <div style="font-size:28px;font-weight:300;">Certificate of Carbon Awareness</div>
          <div style="height:28px;"></div>
          <div style="font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#8B9E7E;">This certifies that</div>
          <div style="height:10px;"></div>
          <div style="font-size:32px;font-weight:300;">${name}</div>
          <div style="height:24px;"></div>
          <div style="font-size:56px;font-weight:200;color:#C8B89A;line-height:1;">${score}</div>
          <div style="height:10px;"></div>
          <div style="font-size:14px;letter-spacing:2px;text-transform:uppercase;">${level}</div>
          <div style="height:28px;"></div>
          <div style="font-size:12px;color:#9A9488;">ID: ${certId} · ${date}</div>
          <div style="height:24px;"></div>
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#C8B89A;">TRACK. REDUCE. SUSTAIN. REPEAT.</div>
        </div>
      </div>
    </div>
  </body>
</html>
`;

