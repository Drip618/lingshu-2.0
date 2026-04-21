import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'config.json');

// 初始化配置
const initConfig = () => {
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig = {
      projectsDir: path.join(process.cwd(), 'projects'),
      defaultProjectType: '剧情'
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
  }
};

// 获取配置
const getConfig = () => {
  initConfig();
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  return {
    projectsDir: path.join(process.cwd(), 'projects'),
    defaultProjectType: '剧情'
  };
};

// 保存配置
const saveConfig = (config: any) => {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
};

// 创建项目目录结构
const createProjectStructure = (projectPath: string) => {
  const dirs = [
    '原始素材',
    '分析报告',
    '剧本',
    '分镜',
    '资产',
    '最终交付'
  ];
  
  dirs.forEach(dir => {
    const dirPath = path.join(projectPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

// 项目管理API
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    
    if (action === 'updateSettings') {
      // 更新设置
      const projectsDir = formData.get('projectsDir') as string;
      const defaultProjectType = formData.get('defaultProjectType') as string;
      
      const config = getConfig();
      if (projectsDir) config.projectsDir = projectsDir;
      if (defaultProjectType) config.defaultProjectType = defaultProjectType;
      saveConfig(config);
      
      return NextResponse.json({ success: true, config }, { status: 200 });
    } else if (action === 'create') {
      // 创建项目
      const config = getConfig();
      const projectName = formData.get('name') as string;
      const projectType = formData.get('type') as string || config.defaultProjectType;
      const projectDescription = formData.get('description') as string || '';
      
      if (!projectName) {
        return NextResponse.json({ error: '项目名称不能为空' }, { status: 400 });
      }
      
      const projectPath = path.join(config.projectsDir, projectName);
      if (fs.existsSync(projectPath)) {
        return NextResponse.json({ error: '项目名称已存在' }, { status: 400 });
      }
      
      // 创建项目目录和结构
      fs.mkdirSync(projectPath, { recursive: true });
      createProjectStructure(projectPath);
      
      // 保存项目信息
      const projectInfo = {
        name: projectName,
        type: projectType,
        description: projectDescription,
        style: '未匹配',
        status: '进行中',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {
          script: '',
          analysis: null,
          assets: [],
          storyboard: []
        }
      };
      
      fs.writeFileSync(
        path.join(projectPath, 'project.json'),
        JSON.stringify(projectInfo, null, 2)
      );
      
      return NextResponse.json({ success: true, project: projectInfo }, { status: 200 });
    } else if (action === 'update') {
      // 更新项目
      const config = getConfig();
      const projectName = formData.get('originalName') as string;
      const newName = formData.get('name') as string;
      const newType = formData.get('type') as string;
      const newDescription = formData.get('description') as string;
      const newStyle = formData.get('style') as string;
      const newStatus = formData.get('status') as string;
      const script = formData.get('script') as string;
      const data = formData.get('data') as string;
      
      if (!projectName) {
        return NextResponse.json({ error: '项目名称不能为空' }, { status: 400 });
      }
      
      const projectPath = path.join(config.projectsDir, projectName);
      if (!fs.existsSync(projectPath)) {
        return NextResponse.json({ error: '项目不存在' }, { status: 404 });
      }
      
      const projectInfoPath = path.join(projectPath, 'project.json');
      const projectInfo = JSON.parse(fs.readFileSync(projectInfoPath, 'utf8'));
      
      // 如果需要重命名项目
      if (newName && newName !== projectName) {
        const newProjectPath = path.join(config.projectsDir, newName);
        if (fs.existsSync(newProjectPath)) {
          return NextResponse.json({ error: '新名称已存在' }, { status: 400 });
        }
        fs.renameSync(projectPath, newProjectPath);
        projectInfo.name = newName;
      }
      
      if (newType) projectInfo.type = newType;
      if (newDescription !== undefined) projectInfo.description = newDescription;
      if (newStyle) projectInfo.style = newStyle;
      if (newStatus) projectInfo.status = newStatus;
      if (script !== undefined) projectInfo.data.script = script;
      if (data) {
        try {
          projectInfo.data = { ...projectInfo.data, ...JSON.parse(data) };
        } catch (e) {
          // 忽略数据解析错误
        }
      }
      projectInfo.updatedAt = new Date().toISOString();
      
      // 确定保存路径
      const savePath = newName && newName !== projectName 
        ? path.join(config.projectsDir, newName, 'project.json')
        : projectInfoPath;
      
      fs.writeFileSync(savePath, JSON.stringify(projectInfo, null, 2));
      
      return NextResponse.json({ success: true, project: projectInfo }, { status: 200 });
    } else if (action === 'delete') {
      // 删除项目
      const config = getConfig();
      const projectName = formData.get('name') as string;
      
      if (!projectName) {
        return NextResponse.json({ error: '项目名称不能为空' }, { status: 400 });
      }
      
      const projectPath = path.join(config.projectsDir, projectName);
      if (!fs.existsSync(projectPath)) {
        return NextResponse.json({ error: '项目不存在' }, { status: 404 });
      }
      
      // 递归删除项目目录
      const deleteDir = (dirPath: string) => {
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath);
          files.forEach(file => {
            const filePath = path.join(dirPath, file);
            if (fs.statSync(filePath).isDirectory()) {
              deleteDir(filePath);
            } else {
              fs.unlinkSync(filePath);
            }
          });
          fs.rmdirSync(dirPath);
        }
      };
      
      deleteDir(projectPath);
      
      return NextResponse.json({ success: true }, { status: 200 });
    }
    
    return NextResponse.json({ error: '无效的操作' }, { status: 400 });
  } catch (error) {
    console.error('项目操作失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

// 获取项目列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'getSettings') {
      // 获取设置
      const config = getConfig();
      return NextResponse.json({ config }, { status: 200 });
    } else if (action === 'getProject') {
      // 获取单个项目
      const config = getConfig();
      const projectName = searchParams.get('name') as string;
      
      const projectPath = path.join(config.projectsDir, projectName);
      if (!fs.existsSync(projectPath)) {
        return NextResponse.json({ error: '项目不存在' }, { status: 404 });
      }
      
      const projectInfoPath = path.join(projectPath, 'project.json');
      if (!fs.existsSync(projectInfoPath)) {
        return NextResponse.json({ error: '项目信息不存在' }, { status: 404 });
      }
      
      const projectInfo = JSON.parse(fs.readFileSync(projectInfoPath, 'utf8'));
      return NextResponse.json({ project: projectInfo }, { status: 200 });
    } else {
      // 获取所有项目
      const config = getConfig();
      const projectsDir = config.projectsDir;
      
      if (!fs.existsSync(projectsDir)) {
        fs.mkdirSync(projectsDir, { recursive: true });
        return NextResponse.json({ projects: [], config }, { status: 200 });
      }
      
      const projectDirs = fs.readdirSync(projectsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      const projects = [];
      for (const dirName of projectDirs) {
        const projectPath = path.join(projectsDir, dirName);
        const projectInfoPath = path.join(projectPath, 'project.json');
        
        if (fs.existsSync(projectInfoPath)) {
          try {
            const projectInfo = JSON.parse(fs.readFileSync(projectInfoPath, 'utf8'));
            projects.push(projectInfo);
          } catch (e) {
            // 跳过损坏的项目
            console.warn(`跳过损坏的项目: ${dirName}`);
          }
        } else {
          // 如果没有project.json，创建一个默认的
          const defaultInfo = {
            name: dirName,
            type: config.defaultProjectType,
            description: '',
            style: '未匹配',
            status: '进行中',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: {
              script: '',
              analysis: null,
              assets: [],
              storyboard: []
            }
          };
          createProjectStructure(projectPath);
          fs.writeFileSync(projectInfoPath, JSON.stringify(defaultInfo, null, 2));
          projects.push(defaultInfo);
        }
      }
      
      return NextResponse.json({ projects, config }, { status: 200 });
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
    return NextResponse.json({ error: '获取项目列表失败' }, { status: 500 });
  }
}
