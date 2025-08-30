import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    
    // Check if audio directory exists
    try {
      await fs.access(audioDir);
    } catch {
      return NextResponse.json({ files: [] });
    }

    // Read directory contents
    const files = await fs.readdir(audioDir);
    
    // Filter for audio files and exclude README
    const audioFiles = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].includes(ext);
      })
      .map(filename => {
        const label = filename
          .replace(/\.[^/.]+$/, '') // Remove extension
          .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
          .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
        
        return {
          filename,
          label: `🎶 ${label}`,
          path: `/audio/${filename}`
        };
      })
      .sort((a, b) => a.filename.localeCompare(b.filename));

    return NextResponse.json({ 
      files: audioFiles,
      count: audioFiles.length 
    });
    
  } catch (error) {
    console.error('Error reading audio files:', error);
    return NextResponse.json(
      { error: 'Failed to read audio files', files: [] }, 
      { status: 500 }
    );
  }
}
