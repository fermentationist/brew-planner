/* global window, Window, navigator setTimeout, console, addEventListener */
import jsPDF from "jspdf";

export const showPDFLabels = async (shippingLabel, callback = null, event) => {
  const pdfSrc = `data:application/pdf;base64, ${encodeURI(shippingLabel)}`;
  const html = `
    <html>
      <body>
        <embed width="100%" height="100%" src="${pdfSrc}"/>
      </body>
    </html>
  `;
  const newWindow = window.open("", "PRINT");
  newWindow.document.write(html);
  newWindow.document.close();
  newWindow.focus();
  
  if (navigator.userAgent.indexOf("Firefox") !== -1) { // one-click print will only work in Firefox
    setTimeout(() => {
      newWindow.print();
      // setTimeout(() => {// uncomment if using one-click printing 
      //   newWindow.close();
      // }, 600);
    }, 1200);
  }
  if (typeof callback === "function") {
    callback(event);
  }
}
export const showPNGLabels = (shippingLabels, callback = null, event) => {
  const pdfDoc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [6, 4]
  });
  shippingLabels.forEach((label, index) => { // combining pngs into single pdf
    const src = `data:image/png;base64, ${encodeURI(label)}`;
    pdfDoc.addImage({
      imageData: src, 
      format: "PNG", 
      x: 0, 
      y: -4, 
      w: 6, 
      h: 4, 
      rotation: -90
    });
    if (index + 1 !== shippingLabels.length) {
      pdfDoc.addPage();
    }
  });
  const output = pdfDoc.output("pdfobjectnewwindow");
  
  if (navigator.userAgent.indexOf("Firefox") !== -1){ // one-click print will only work in Firefox
    setTimeout(() => {
      output.print();
      // setTimeout(() => {// uncomment if using one-click printing
      //   output.close();
      // }, 600);
    }, 1200);
  }
  if (typeof callback === "function") {
    callback(event);
  }
}

