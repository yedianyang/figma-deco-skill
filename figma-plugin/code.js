// Moodboard Importer — FigJam Plugin
// Fetches grouped image data from localhost:3000/data and inserts into FigJam canvas

const IMAGE_WIDTH = 300;
const IMAGES_PER_ROW = 4;
const GAP = 16;
const GROUP_GAP = 80;
const TITLE_HEIGHT = 40;

figma.showUI(__html__, { width: 320, height: 240 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'import') {
    const data = msg.data;

    if (!data || !data.groups || data.groups.length === 0) {
      figma.notify('No image data to import.');
      figma.closePlugin();
      return;
    }

    let totalImages = 0;
    let yOffset = 0;

    for (const group of data.groups) {
      if (!group.images || group.images.length === 0) continue;

      // Create section for this group
      const section = figma.createSection();
      section.name = group.name || 'Untitled Group';

      const imageNodes = [];

      for (let i = 0; i < group.images.length; i++) {
        const imgData = group.images[i];
        const imageUrl = imgData.thumbUrl || imgData.url;

        if (!imageUrl) continue;

        try {
          const image = await figma.createImageAsync(imageUrl);
          const rect = figma.createRectangle();

          // Calculate dimensions maintaining aspect ratio
          const aspectRatio = (imgData.width && imgData.height)
            ? imgData.height / imgData.width
            : 0.75; // default 4:3
          const scaledHeight = Math.round(IMAGE_WIDTH * aspectRatio);

          rect.resize(IMAGE_WIDTH, scaledHeight);
          rect.fills = [{ type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' }];

          // Grid position
          const col = i % IMAGES_PER_ROW;
          const row = Math.floor(i / IMAGES_PER_ROW);
          rect.x = col * (IMAGE_WIDTH + GAP);
          rect.y = TITLE_HEIGHT + row * (scaledHeight + GAP);

          section.appendChild(rect);
          imageNodes.push(rect);
          totalImages++;
        } catch (err) {
          console.error('Failed to load image:', imageUrl, err);
        }
      }

      // Size section to fit its content
      if (imageNodes.length > 0) {
        const cols = Math.min(imageNodes.length, IMAGES_PER_ROW);
        const rows = Math.ceil(imageNodes.length / IMAGES_PER_ROW);
        const sampleHeight = imageNodes[0].height;

        section.x = 0;
        section.y = yOffset;
        section.resizeWithoutConstraints(
          cols * (IMAGE_WIDTH + GAP) - GAP + 40,
          TITLE_HEIGHT + rows * (sampleHeight + GAP) - GAP + 40
        );

        yOffset += section.height + GROUP_GAP;
      }
    }

    const groupCount = data.groups.filter(g => g.images && g.images.length > 0).length;
    figma.notify(`Imported ${totalImages} images in ${groupCount} groups`);
    figma.closePlugin();
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
