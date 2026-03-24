// utils/certificate.ts

import type { LevelName } from '../constants/levels';

export function certificateHTML(
  name: string,
  score: number,
  level: LevelName | string,
  certId: string,
  date: string,
  bgDataUrl: string
): string {
  const displayName = (name || 'User').trim() || 'User';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    @page { 
    size: 1280px 720px;
    margin: 0; }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1280px;
      height: 720px;
      font-family: Arial, sans-serif;
    }

    .cert {
      width: 1280px;
      height: 720px;
      position: relative;
      background-image: url('${bgDataUrl}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    .name {
      position: absolute;
      top: 130px;
      left: 0; right: 0;
      text-align: center;
      font-size: 42px;
      font-weight: bold;
      color: rgb(40,120,130);
    }

    .score {
      position: absolute;
      top: 300px;
      left: 0; right: 0;
      text-align: center;
      font-size: 110px;
      font-weight: bold;
      color: rgb(90,170,80);
    }

    .badge {
      position: absolute;
      top: 530px;
      left: 200px;
      width: 400px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      color: white;
    }

    .level {
      position: absolute;
      top: 530px;
      right: 200px;
      width: 400px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      color: white;
    }

    .cert-id {
      position: absolute;
      bottom: 40px;
      left: 80px;
      font-size: 18px;
      color: rgb(198,223,222);
    }

    .date {
      position: absolute;
      bottom: 40px;
      right: 80px;
      font-size: 18px;
      color: rgb(198,223,222);
    }

    .footer {
      position: absolute;
      bottom: 10px;
      left: 0; right: 0;
      text-align: center;
      font-size: 16px;
      color: rgb(190,210,200);
    }
  </style>
</head>
<body>
  <div class="cert">

    <div class="name">${displayName}</div>
    <div class="score">${score}</div>

    <div class="badge">Badge: ${level}</div>
    <div class="level">Level: ${level}</div>

    <div class="cert-id">Certificate ID: ${certId}</div>
    <div class="date">Issued on: ${date}</div>

    <div class="footer">
      carbon27.ai<br/>
      Track. Reduce. Sustain. Repeat.
    </div>

  </div>
</body>
</html>
  `.trim();
}