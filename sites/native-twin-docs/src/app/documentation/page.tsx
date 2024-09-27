export default function DocsPage() {
  return (
    <section>
      <h1>Quick Starter</h1>
      
      <section>
        <h2>Introducción rápida</h2>
        <p>
          Breve descripción de la herramienta/producto/servicio. Esta herramienta permite a los desarrolladores 
          configurar un entorno de desarrollo rápidamente y comenzar a usar la aplicación con facilidad.
        </p>
        <p>
          Explicación del propósito o beneficio clave: optimiza el tiempo de configuración inicial 
          y proporciona herramientas esenciales para el desarrollo.
        </p>
      </section>

      <section>
        <h2>Requisitos previos</h2>
        <ul>
          <li>Software o hardware necesario: Procesador de 64 bits, 4GB RAM mínimo.</li>
          <li>Dependencias: Node.js  14, npm o yarn, Git.</li>
          <li>Instalaciones previas (si aplica): Docker (opcional), CLI de Node.js.</li>
        </ul>
      </section>

      <section>
        <h2>Instalación</h2>
        <p>Pasos básicos para instalar el producto o configurar el entorno:</p>
        <ul>
          <li>
            Windows/macOS/Linux: Instalar Node.js desde <a href="https://nodejs.org">nodejs.org</a>.
          </li>
          <li>
            Clonar el repositorio:
            <pre><code>git clone https://github.com/proyecto/quickstarter.git</code></pre>
          </li>
          <li>
            Instalar dependencias:
            <pre><code>npm install</code></pre>
          </li>
        </ul>
      </section>

      <section>
        <h2>Configuración mínima</h2>
        <p>Configuraciones iniciales obligatorias para que el producto funcione:</p>
        <ul>
          <li>Crear un archivo <code>.env</code> basado en <code>.env.example</code>.</li>
          <li>Definir las variables de entorno necesarias, como <code>DATABASE_URL</code>, <code>API_KEY</code>, etc.</li>
          <li>
            Ejemplo de configuración rápida:
            <pre><code>{`DATABASE_URL=postgres://user:password@localhost:5432/mydb`}</code></pre>
          </li>
        </ul>
      </section>

      <section>
        <h2>Primer uso</h2>
        <p>Comando básico o primer paso para ejecutar la herramienta:</p>
        <pre><code>npm run start</code></pre>
        <p>
          Este comando inicia la aplicación y puedes acceder a ella en el navegador en <code>http://localhost:3000</code>.
        </p>
      </section>

      <section>
        <h2>Problemas comunes y soluciones rápidas (FAQ)</h2>
        <p>Errores comunes que los usuarios pueden encontrar al empezar:</p>
        <ul>
          <li>
            <strong>Error:</strong> "Cannot find module 'X'".
            <br />
            <strong>Solución:</strong> Asegúrate de haber ejecutado <code>npm install</code> para instalar todas las dependencias.
          </li>
          <li>
            <strong>Error:</strong> "Port 3000 already in use".
            <br />
            <strong>Solución:</strong> Cambia el puerto en el archivo de configuración o libera el puerto ocupado.
          </li>
        </ul>
      </section>

      <section>
        <h2>Recursos adicionales</h2>
        <ul>
          <li>
            Documentación completa: <a href="https://docs.proyecto.com">docs.proyecto.com</a>
          </li>
          <li>
            Foros de soporte: <a href="https://forum.proyecto.com">forum.proyecto.com</a>
          </li>
        </ul>
      </section>
    </section>
  );
}
