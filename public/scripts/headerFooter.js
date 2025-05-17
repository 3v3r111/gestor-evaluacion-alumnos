export async function insertarComponentes() {
    try {
      const header = await fetch('../components/header.html').then(res => res.text());
      const footer = await fetch('../components/footer.html').then(res => res.text());
  
      const headerContainer = document.getElementById('header');
      const footerContainer = document.getElementById('footer');
  
      if (headerContainer) headerContainer.innerHTML = header;
      if (footerContainer) footerContainer.innerHTML = footer;
    } catch (error) {
      console.error("Error al cargar header o footer:", error);
    }
  }
  