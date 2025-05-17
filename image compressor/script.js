
async function compressAndConvert() {
  const file = document.getElementById("imageInput").files[0];
  const quality = parseFloat(document.getElementById("quality").value);
  const format = document.getElementById("format").value;
  const resizeWidth = parseInt(document.getElementById("resizeWidth").value) || null;
  const resizeHeight = parseInt(document.getElementById("resizeHeight").value) || null;

  if (!file || isNaN(quality)) {
    alert("Please select an image and enter a valid quality value.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      const width = resizeWidth || img.width;
      const height = resizeHeight || img.height;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(function (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.getElementById("downloadLink");
        link.href = url;
        link.download = "converted_image." + format;
        link.style.display = "block";
        link.textContent = "Download Image";
      }, "image/" + format, quality);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function convertToPDF() {
  const file = document.getElementById("imageInput").files[0];
  if (!file) {
    alert("Please select an image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = async function () {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(img);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("image.pdf");
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function convertPDFToImage() {
  const file = document.getElementById("imageInput").files[0];
  if (!file || file.type !== "application/pdf") {
    alert("Please upload a valid PDF file.");
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = function () {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then(pdf => {
      pdf.getPage(1).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
          canvas.toBlob(function (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.getElementById("downloadLink");
            link.href = url;
            link.download = "pdf_page.png";
            link.style.display = "block";
            link.textContent = "Download Image from PDF";
          });
        });
      });
    });
  };
  fileReader.readAsArrayBuffer(file);
}
