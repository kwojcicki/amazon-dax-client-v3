
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function createLambdaZip(zipName = 'lambda.zip') {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipName);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        output.on('close', () => {
            console.log(`✅ ${zipName} created successfully`);
            console.log(`📦 Total bytes: ${archive.pointer()}`);
            resolve();
        });

        archive.on('error', (err) => {
            console.error('❌ Error creating zip:', err);
            reject(err);
        });

        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.warn('⚠️  Warning:', err);
            } else {
                reject(err);
            }
        });

        archive.pipe(output);

        // Check if dist folder exists
        const distPath = path.join(process.cwd(), 'dist');
        if (fs.existsSync(distPath)) {
            console.log('📁 Adding files from dist/ to zip root...');

            // Add all files from dist folder to the root of the zip
            const files = fs.readdirSync(distPath, { withFileTypes: true });

            for (const file of files) {
                const filePath = path.join(distPath, file.name);

                if (file.isDirectory()) {
                    // Add directory and its contents to zip root
                    archive.directory(filePath, file.name);
                } else {
                    // Add file to zip root
                    archive.file(filePath, { name: file.name });
                }
            }
        } else {
            console.warn('⚠️  dist/ folder not found');
        }

        // Check if node_modules folder exists
        const nodeModulesPath = path.join(process.cwd(), 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
            console.log('📦 Adding node_modules/ folder...');
            // Add entire node_modules folder (maintaining folder structure)
            archive.directory(nodeModulesPath, 'node_modules');

            // Manually adding amazon-dax-client-sdv3 since its normally symlinked and archiver skips that
            archive.directory(path.join(process.cwd(), '../dist'), 'node_modules/amazon-dax-client-sdkv3/dist');
            archive.file(path.join(process.cwd(), '../package.json'), { name: 'node_modules/amazon-dax-client-sdkv3/package.json' });
        } else {
            console.warn('⚠️  node_modules/ folder not found');
        }

        // Finalize the archive
        archive.finalize();
    });
}

// Run the script
async function main() {
    try {
        const zipName = process.argv[2] || 'lambda.zip';
        console.log(`🚀 Creating ${zipName}...`);
        await createLambdaZip(zipName);
        console.log('✨ Done!');
    } catch (error) {
        console.error('💥 Failed to create zip:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { createLambdaZip };