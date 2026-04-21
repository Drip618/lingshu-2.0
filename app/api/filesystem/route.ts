import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, mkdir, access } from 'fs/promises';
import { join, basename, dirname, resolve } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const path = searchParams.get('path') || '/Users/Drip';

    if (action === 'browse') {
      return await browseDirectory(path);
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch (error) {
    console.error('文件系统操作失败:', error);
    return NextResponse.json({ error: '文件系统操作失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, path, name } = body;

    if (action === 'createFolder') {
      return await createFolder(path, name);
    }

    if (action === 'rename') {
      return await renameItem(path, name);
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch (error) {
    console.error('文件系统操作失败:', error);
    return NextResponse.json({ error: '文件系统操作失败' }, { status: 500 });
  }
}

async function browseDirectory(dirPath: string): Promise<NextResponse> {
  try {
    const resolvedPath = resolve(dirPath);
    
    // 安全检查：确保路径在用户目录下
    if (!resolvedPath.startsWith('/Users/Drip')) {
      return NextResponse.json({ error: '无权访问此路径' }, { status: 403 });
    }

    // 检查路径是否存在
    if (!existsSync(resolvedPath)) {
      return NextResponse.json({ error: '路径不存在' }, { status: 404 });
    }

    // 检查是否是目录
    const stats = await stat(resolvedPath);
    if (!stats.isDirectory()) {
      return NextResponse.json({ error: '不是有效目录' }, { status: 400 });
    }

    // 读取目录内容
    const items = await readdir(resolvedPath, { withFileTypes: true });
    
    // 分离文件夹和文件，并获取详细信息
    const directories = [];
    const files = [];

    for (const item of items) {
      try {
        const itemPath = join(resolvedPath, item.name);
        const itemStats = await stat(itemPath);
        
        const fileInfo = {
          name: item.name,
          path: itemPath,
          isDir: item.isDirectory(),
          size: itemStats.size,
          modifiedAt: itemStats.mtime.toISOString(),
          createdAt: itemStats.birthtime.toISOString()
        };

        if (item.isDirectory()) {
          directories.push(fileInfo);
        } else {
          files.push(fileInfo);
        }
      } catch (error) {
        console.error(`读取项目 ${item.name} 失败:`, error);
      }
    }

    // 排序：文件夹在前，按名称排序；文件在后，按名称排序
    directories.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    files.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

    // 获取父级路径（用于导航）
    const parentPath = dirname(resolvedPath);

    return NextResponse.json({
      success: true,
      currentPath: resolvedPath,
      parentPath: parentPath !== resolvedPath ? parentPath : null,
      contents: [...directories, ...files],
      totalItems: directories.length + files.length,
      directoryCount: directories.length,
      fileCount: files.length
    });

  } catch (error) {
    console.error('浏览目录失败:', error);
    return NextResponse.json({ error: '浏览目录失败' }, { status: 500 });
  }
}

async function createFolder(parentPath: string, folderName: string): Promise<NextResponse> {
  try {
    if (!folderName || folderName.trim() === '') {
      return NextResponse.json({ error: '文件夹名称不能为空' }, { status: 400 });
    }

    // 清理文件夹名称（移除特殊字符）
    const cleanName = folderName.replace(/[<>:"/\\|?*]/g, '').trim();
    if (cleanName === '') {
      return NextResponse.json({ error: '文件夹名称包含非法字符' }, { status: 400 });
    }

    const resolvedParentPath = resolve(parentPath);
    const newFolderPath = join(resolvedParentPath, cleanName);

    // 安全检查
    if (!resolvedParentPath.startsWith('/Users/Drip')) {
      return NextResponse.json({ error: '无权在此路径创建文件夹' }, { status: 403 });
    }

    // 检查父目录是否存在
    if (!existsSync(resolvedParentPath)) {
      return NextResponse.json({ error: '父目录不存在' }, { status: 404 });
    }

    // 检查文件夹是否已存在
    if (existsSync(newFolderPath)) {
      return NextResponse.json({ error: '文件夹已存在' }, { status: 409 });
    }

    // 创建文件夹
    await mkdir(newFolderPath, { recursive: true });

    return NextResponse.json({
      success: true,
      message: `文件夹 "${cleanName}" 创建成功`,
      path: newFolderPath,
      name: cleanName
    });

  } catch (error) {
    console.error('创建文件夹失败:', error);
    return NextResponse.json({ error: '创建文件夹失败' }, { status: 500 });
  }
}

async function renameItem(oldPath: string, newName: string): Promise<NextResponse> {
  try {
    // 这个功能可以后续实现
    return NextResponse.json({ error: '重命名功能开发中' }, { status: 501 });
  } catch (error) {
    console.error('重命名失败:', error);
    return NextResponse.json({ error: '重命名失败' }, { status: 500 });
  }
}
