/// <reference lib="webworker" />

addEventListener('message', async ({ data }) => {
  const file: File = data;

  const bitmap = await createImageBitmap(file);

  const canvas = new OffscreenCanvas(bitmap.width / 2, bitmap.height / 2);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await canvas.convertToBlob({
    type: "image/jpeg",
    quality: 0.7
  });

  postMessage(blob);
});
