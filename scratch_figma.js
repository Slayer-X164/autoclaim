const fs = require('fs');
const desktopPath = '/home/slayer/.gemini/antigravity/brain/e4a114d7-a5c7-4882-96a2-f2f85b64098a/.system_generated/steps/394/output.txt';

function analyze(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const jsonStart = content.indexOf('{');
  if(jsonStart === -1) return { summary: "No JSON", images: [] };
  const jsonStr = content.substring(jsonStart);
  try {
    const data = JSON.parse(jsonStr);
    
    let result = [];
    let images = [];
    
    function traverse(node, depth=0) {
      if(!node) return;
      const indent = "  ".repeat(depth);
      let info = `${indent}- ${node.name} (${node.type})`;
      if (node.characters) {
          info += ` text: "${node.characters}"`;
          if (node.style) {
              info += ` font: ${node.style.fontSize}px ${node.style.fontFamily} w${node.style.fontWeight}`;
              if(node.fills && node.fills[0] && node.fills[0].color) {
                  const c = node.fills[0].color;
                  info += ` color: rgba(${Math.round(c.r*255)}, ${Math.round(c.g*255)}, ${Math.round(c.b*255)}, ${c.a})`;
              }
          }
      }
      if (node.fills && node.fills.some(f => f.type === 'IMAGE' || f.type === 'VECTOR')) {
          info += ` [IMAGE/VECTOR node_id: ${node.id}]`;
          images.push(node.id);
      } else if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION') {
          info += ` [VECTOR node_id: ${node.id}]`;
          images.push(node.id);
      }
      if (node.backgroundColor || (node.fills && node.fills[0] && node.fills[0].color)) {
         let color = node.backgroundColor || node.fills[0].color;
         if(color && color.r !== undefined) {
             info += ` bg: rgba(${Math.round(color.r*255)}, ${Math.round(color.g*255)}, ${Math.round(color.b*255)}, ${color.a})`;
         }
      }
      if(node.layoutMode) {
          info += ` layout: ${node.layoutMode} gap: ${node.itemSpacing} pad: ${node.paddingTop}/${node.paddingRight}/${node.paddingBottom}/${node.paddingLeft}`;
      }
      if(node.primaryAxisAlignItems) info += ` alignPrimary: ${node.primaryAxisAlignItems}`;
      if(node.counterAxisAlignItems) info += ` alignCounter: ${node.counterAxisAlignItems}`;
      if(node.cornerRadius) info += ` radius: ${node.cornerRadius}`;
      if(node.absoluteBoundingBox) info += ` w: ${node.absoluteBoundingBox.width} h: ${node.absoluteBoundingBox.height}`;
      
      result.push(info);
      if (node.children) {
        for(let child of node.children) {
            traverse(child, depth+1);
        }
      }
    }
    
    // Figma API returns a top-level object containing "nodes"
    let root = data.nodes ? Object.values(data.nodes)[0].document : data;
    traverse(root);
    return { summary: result.join('\n'), images };
  } catch (e) {
    return { summary: e.message, images: [] };
  }
}

console.log("=== DESKTOP ===");
const d = analyze(desktopPath);
console.log(d.summary);
console.log("Images:", d.images);
