import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 支持的文件格式配置
const ALLOWED_FILE_TYPES = {
  // 文档类
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  
  // 图片类
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  'image/bmp': ['.bmp'],
  
  // 音频类
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  'audio/aac': ['.aac'],
  
  // 视频类
  'video/mp4': ['.mp4'],
  'video/x-msvideo': ['.avi'],
  'video/quicktime': ['.mov'],
  'video/x-matroska': ['.mkv'],
  'video/webm': ['.webm'],
  
  // 文本类（备用）
  'text/*': ['.txt', '.md', '.csv', '.json', '.xml']
};

// 最大文件大小限制 (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// 获取文件扩展名
function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

// 检查文件类型是否允许
function isFileTypeAllowed(filename: string, mimeType: string): boolean {
  const ext = getFileExtension(filename);
  
  // 检查MIME类型
  if (ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES]) {
    const allowedExts = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
    return allowedExts.includes(ext);
  }
  
  // 检查通配符MIME类型
  for (const [pattern, extensions] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (pattern.endsWith('/*')) {
      const baseType = pattern.replace('/*', '');
      if (mimeType.startsWith(baseType) && extensions.includes(ext)) {
        return true;
      }
    }
  }
  
  // 如果MIME类型未知，检查扩展名是否在允许列表中
  const allAllowedExtensions = Object.values(ALLOWED_FILE_TYPES).flat();
  return allAllowedExtensions.includes(ext);
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 文件上传API - 增强版
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const projectId = formData.get('projectId') as string || formData.get('project') as string;
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    
    console.log('收到文件上传请求:', { projectId, fileName: file?.name, fileSize: file?.size });
    
    if (!file) {
      return NextResponse.json({ error: '请选择要上传的文件' }, { status: 400 });
    }
    
    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `文件太大，最大允许 ${formatFileSize(MAX_FILE_SIZE)}`,
        maxSize: MAX_FILE_SIZE,
        currentSize: file.size
      }, { status: 400 });
    }
    
    // 验证文件类型
    if (!isFileTypeAllowed(file.name, file.type)) {
      return NextResponse.json({ 
        error: `不支持的文件格式: ${getFileExtension(file.name)}`,
        allowedFormats: Object.values(ALLOWED_FILE_TYPES).flat()
      }, { status: 400 });
    }
    
    // 确定项目目录
    let projectDir: string;
    if (projectId && projectId !== 'temp') {
      projectDir = path.join(process.cwd(), 'projects', projectId);
      
      // 如果项目不存在，创建它
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
        
        // 创建基本的项目信息文件
        const projectInfo = {
          id: Date.now().toString(),
          name: projectId,
          type: '未分类',
          description: '通过文件上传创建的项目',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(
          path.join(projectDir, 'project.json'),
          JSON.stringify(projectInfo, null, 2)
        );
      }
    } else {
      // 临时文件存储目录
      projectDir = path.join(process.cwd(), 'temp', 'uploads');
    }
    
    // 创建上传文件夹
    const uploadDir = path.join(projectDir, folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // 生成唯一文件名（保留原始扩展名）
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const originalExt = getFileExtension(file.name);
    const fileName = `${timestamp}_${randomSuffix}${originalExt}`;
    const filePath = path.join(uploadDir, fileName);
    
    // 保存文件
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    
    console.log(`文件保存成功: ${fileName} (${formatFileSize(buffer.length)})`);
    
    // 如果是文本文件，尝试读取内容
    let textContent = null;
    if (file.type.startsWith('text/') || 
        ['.txt', '.md', '.csv', '.json', '.xml'].includes(originalExt)) {
      try {
        textContent = buffer.toString('utf-8');
        console.log(`已提取文本内容，长度: ${textContent.length} 字符`);
      } catch (error) {
        console.error('读取文本内容失败:', error);
      }
    }
    
    // 更新项目的updatedAt时间
    if (projectId && projectId !== 'temp') {
      const projectInfoPath = path.join(projectDir, 'project.json');
      if (fs.existsSync(projectInfoPath)) {
        try {
          const projectInfo = JSON.parse(fs.readFileSync(projectInfoPath, 'utf8'));
          projectInfo.updatedAt = new Date().toISOString();
          
          // 更新项目数据中的上传文件列表
          if (!projectInfo.data) {
            projectInfo.data = {};
          }
          if (!projectInfo.data.uploadedFiles) {
            projectInfo.data.uploadedFiles = [];
          }
          
          // 添加到上传文件列表
          projectInfo.data.uploadedFiles.push({
            name: file.name,
            storedName: fileName,
            size: file.size,
            type: file.type,
            path: `/${folder}/${fileName}`,
            uploadedAt: new Date().toISOString()
          });
          
          // 如果有文本内容，保存到script字段
          if (textContent && !projectInfo.data.script) {
            projectInfo.data.script = textContent.substring(0, 50000); // 限制长度防止过大
          }
          
          fs.writeFileSync(projectInfoPath, JSON.stringify(projectInfo, null, 2));
        } catch (error) {
          console.error('更新项目信息失败:', error);
        }
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: '文件上传成功',
      file: {
        name: fileName,
        originalName: file.name,
        size: file.size,
        formattedSize: formatFileSize(file.size),
        type: file.type,
        extension: originalExt,
        path: `/${projectId}/${folder}/${fileName}`,
        url: `/api/files/${projectId}/${folder}/${fileName}`
      },
      textContent: textContent ? {
        length: textContent.length,
        preview: textContent.substring(0, 500) + (textContent.length > 500 ? '...' : '')
      } : null,
      uploadedAt: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json({ 
      error: '文件上传失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

// 获取项目文件列表 - 增强版
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('project') || request.nextUrl.searchParams.get('projectId');
    const folder = request.nextUrl.searchParams.get('folder') || 'uploads';
    
    if (!projectId) {
      return NextResponse.json({ error: '项目ID不能为空' }, { status: 400 });
    }
    
    const projectDir = path.join(process.cwd(), 'projects', projectId);
    if (!fs.existsSync(projectDir)) {
      return NextResponse.json({ error: '项目不存在', files: [] }, { status: 404 });
    }
    
    const folderPath = path.join(projectDir, folder);
    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ files: [], totalSize: 0, totalCount: 0 }, { status: 200 });
    }
    
    // 获取文件列表及详细信息
    const files = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => {
        const filePath = path.join(folderPath, dirent.name);
        const stats = fs.statSync(filePath);
        return {
          name: dirent.name,
          size: stats.size,
          formattedSize: formatFileSize(stats.size),
          extension: getFileExtension(dirent.name),
          mtime: stats.mtime.toISOString(),
          ctime: stats.ctime.toISOString(),
          path: `/${projectId}/${folder}/${dirent.name}`,
          url: `/api/files/${projectId}/${folder}/${dirent.name}`
        };
      })
      .sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime()); // 按时间倒序
    
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    return NextResponse.json({ 
      files,
      totalCount: files.length,
      totalSize,
      formattedTotalSize: formatFileSize(totalSize)
    }, { status: 200 });
    
  } catch (error) {
    console.error('获取文件列表失败:', error);
    return NextResponse.json({ error: '获取文件列表失败' }, { status: 500 });
  }
}

// 删除文件
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project');
    const filePath = searchParams.get('path');
    
    if (!projectId || !filePath) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    
    const fullPath = path.join(process.cwd(), 'projects', projectId, filePath);
    
    // 安全检查：确保路径在项目目录内
    if (!fullPath.startsWith(path.join(process.cwd(), 'projects', projectId))) {
      return NextResponse.json({ error: '非法路径' }, { status: 403 });
    }
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return NextResponse.json({ success: true, message: '文件删除成功' });
    } else {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }
    
  } catch (error) {
    console.error('删除文件失败:', error);
    return NextResponse.json({ error: '删除文件失败' }, { status: 500 });
  }
}
