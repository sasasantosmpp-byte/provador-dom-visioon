// Catálogo modular: para adicionar uma armação, copie a imagem PNG (fundo transparente,
// recortada rente à armação) para assets/frames/ e acrescente um item aqui.
// fit = largura da armação relativa à largura do rosto (ajuste fino) | dy = deslocamento vertical.
export const PRICE_PREFIX = 'a partir de ';
export const glasses = [
  { id:'DV01', name:'Armação 01', price:55, color:'Azul degradê',  image:'assets/frames/dv01.png?v=7', fit:1.0, dy:0 },
  { id:'DV02', name:'Armação 02', price:55, color:'Lilás acinzentado',         image:'assets/frames/dv02.png?v=7', fit:1.0, dy:0 },
  { id:'DV03', name:'Armação 03', price:55, color:'Coral',  image:'assets/frames/dv03.png?v=7', fit:1.0, dy:0 },
  { id:'DV04', name:'Armação 04', price:55, color:'Rosa claro',    image:'assets/frames/dv04.png?v=7', fit:1.0, dy:0 },
  { id:'DV05', name:'Armação 05', price:55, color:'Roxo',         image:'assets/frames/dv05.png?v=7', fit:1.0, dy:0 },
  { id:'DV06', name:'Armação 06', price:55, color:'Preto', image:'assets/frames/dv06.png?v=7', fit:1.0, dy:0 },
  { id:'DV07', name:'Armação 07', price:55, color:'Preto',        image:'assets/frames/dv07.png?v=7', fit:1.0, dy:0 },
  { id:'DV08', name:'Armação 08', price:55, color:'Azul fosco', image:'assets/frames/dv08.png?v=7', fit:1.0, dy:0 },
  { id:'DV09', name:'Armação 09', price:55, color:'Verde-água', image:'assets/frames/dv09.png?v=7', fit:1.0, dy:0 },
];
export const WHATSAPP = '5524981072604';
export const money = v => 'R$ ' + v.toLocaleString('pt-BR',{minimumFractionDigits:0});
