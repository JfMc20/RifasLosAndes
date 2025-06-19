const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

const PUBLIC_IMAGES_DIR = path.join(__dirname, '../public/images');
const OPTIMIZED_DIR = path.join(__dirname, '../public/images/optimized');

// Crear directorios de destino si no existen
if (!fs.existsSync(OPTIMIZED_DIR)) {
  fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
}

// Configuraciones para diferentes tamaños y formatos
const formats = [
  {
    format: 'webp',
    quality: 80,  // Mejor compresión con buena calidad
  },
  {
    format: 'avif',
    quality: 75,  // AVIF permite mejor compresión que WebP
  }
];

const sizes = [
  { width: 640, suffix: 'sm' },
  { width: 1280, suffix: 'md' },
  { width: 1920, suffix: 'lg' },
];

async function optimizeImage(inputFile) {
  try {
    const filename = path.basename(inputFile, path.extname(inputFile));
    
    console.log(`Procesando: ${filename}`);
    
    // Cargar la imagen
    const image = sharp(inputFile, { failOn: 'none' });
    const metadata = await image.metadata();
    
    if (!metadata || !metadata.width || !metadata.height) {
      console.error(`Error: No se pudo leer los metadatos de ${filename}`);
      return false;
    }
    
    // Mantener relación de aspecto
    const aspectRatio = metadata.width / metadata.height;
    
    // Procesar cada tamaño y formato
    for (const size of sizes) {
      const height = Math.round(size.width / aspectRatio);
      
      for (const format of formats) {
        const outputFilename = `${filename}-${size.suffix}.${format.format}`;
        const outputPath = path.join(OPTIMIZED_DIR, outputFilename);
        
        await image
          .resize(size.width, height, { fit: 'inside' })
          .toFormat(format.format, { quality: format.quality })
          .toFile(outputPath);
        
        console.log(`Generado: ${outputFilename} (${format.format}, ${size.width}x${height})`);
      }
    }
    
    // También crear una versión de placeholder muy pequeña
    const placeholderWidth = 20;
    const placeholderHeight = Math.round(placeholderWidth / aspectRatio);
    
    await image
      .resize(placeholderWidth, placeholderHeight)
      .toFormat('webp', { quality: 20 })
      .toFile(path.join(OPTIMIZED_DIR, `${filename}-placeholder.webp`));
      
    console.log(`Generado placeholder para: ${filename}`);
    return true;
  } catch (error) {
    console.error(`Error al procesar ${path.basename(inputFile)}: ${error.message}`);
    return false;
  }
}

// Función para descargar una imagen desde URL
async function downloadImage(url, outputPath) {
  try {
    const tempPath = `${outputPath}.tmp`;
    const fileStream = fs.createWriteStream(tempPath);
    
    await new Promise((resolve, reject) => {
      https.get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }
        
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          fs.renameSync(tempPath, outputPath);
          resolve();
        });
      }).on('error', err => {
        fs.unlinkSync(tempPath);
        reject(err);
      });
    });
    
    console.log(`Imagen descargada: ${url}`);
    return outputPath;
  } catch (error) {
    console.error(`Error al descargar ${url}: ${error.message}`);
    return null;
  }
}

async function optimizeRemoteImage(url) {
  try {
    const urlObj = new URL(url);
    const filename = path.basename(urlObj.pathname);
    const localPath = path.join(PUBLIC_IMAGES_DIR, `temp-${filename}`);
    
    // Descargar primero la imagen
    console.log(`Descargando imagen desde: ${url}`);
    const downloadedPath = await downloadImage(url, localPath);
    
    if (!downloadedPath) {
      console.error(`No se pudo descargar: ${url}`);
      return false;
    }
    
    // Ahora optimizar la imagen local
    const success = await optimizeImage(downloadedPath);
    
    // Eliminar archivo temporal
    if (fs.existsSync(downloadedPath)) {
      fs.unlinkSync(downloadedPath);
    }
    
    return success;
  } catch (error) {
    console.error(`Error al optimizar imagen remota ${url}: ${error.message}`);
    return false;
  }
}

async function processAllImages() {
  try {
    // Procesar imágenes locales
    const files = fs.readdirSync(PUBLIC_IMAGES_DIR);
    
    // Filtrar sólo archivos de imágenes
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) && 
             !file.includes('-sm') && !file.includes('-md') && !file.includes('-lg') &&
             !file.includes('placeholder') && !file.includes('temp-');
    });
    
    console.log(`Encontradas ${imageFiles.length} imágenes locales para optimizar`);
    
    // Procesar cada imagen local
    let successCount = 0;
    for (const file of imageFiles) {
      const success = await optimizeImage(path.join(PUBLIC_IMAGES_DIR, file));
      if (success) successCount++;
    }
    
    // También optimizar imágenes remotas más comunes
    const remoteUrls = [
      'https://api.rifalosandes.es/uploads/file-1750274851409-45af3707-007f-43cf-affe-ef863b96fa01.webp',
      'https://api.rifalosandes.es/uploads/file-1750274854876-5903c7e9-2d93-4b8f-843a-46c120a0aaa7.webp'
    ];
    
    console.log(`Optimizando ${remoteUrls.length} imágenes remotas`);
    
    for (const url of remoteUrls) {
      await optimizeRemoteImage(url);
    }
    
    console.log(`¡Optimización completada! ${successCount}/${imageFiles.length} imágenes locales procesadas correctamente.`);
  } catch (error) {
    console.error('Error al procesar imágenes:', error);
  }
}

processAllImages();
