import { Compiler } from 'webpack'
import {
    getWebpackSystemInfos,
    setRuntimeChunk,
    makeEnvironment,
    getOutput,
    getEntry
} from './tools'

export interface IFileInfo {
    /**
     * 文件绝对路径
     */
    absolutePath: string
    /**
     * 文件依赖
     */
    dependencies: string[]
    /**
     * import时的相对路径
     */
    importPath: string
}

/**
 * 文件分析器类型
 */
export type FileAnalyzer = (fileAbsolutePath: string, aliasInfos: IAliasInfo[]) => IFileInfo

export interface IOptions {
    /**
     * wxss 文件在src源代码中所对应的后缀
     * default wxss
     */
    wxssSrcSuffix: string
    /**
     * 是否使用了 ts
     * default false
     */
    isUseTs: boolean
    /**
     * 输出目录
     */
    outputDir: string
}

export interface IAliasInfo {
    /**
     * 符号
     */
    symbol: string
    /**
     * 路径
     */
    path: string
}

export interface IWebpackSystemInfo {
    srcDir: string
    aliasInfos: IAliasInfo[]
}

export class WxMiniProgramOriginalPlugin {
    private static readonly PLUGIN_NAME = 'WxMiniProgramOriginalPlugin'
    /**
     * 从 webpack 中所获取的信息
     */
    private webpackSystemInfo: IWebpackSystemInfo = { srcDir: '', aliasInfos: [] }
    /**
     * 插件所在目录（也就是Index.ts文件所在目录）
     */
    private pluginDir: string
    /**
     * 插件设置信息
     */
    private options: IOptions

    constructor(options: Partial<IOptions>) {
        this.pluginDir = __dirname
        const { wxssSrcSuffix = 'wxss', isUseTs = false, outputDir } = options

        if (!outputDir) {
            throw new Error('options outputDir not set')
        }

        this.options = {
            wxssSrcSuffix,
            isUseTs,
            outputDir
        }
        // 准备环境
        makeEnvironment(this.pluginDir)
    }

    apply(compiler: Compiler) {
        // 获取webpack 系统信息
        this.webpackSystemInfo = getWebpackSystemInfos(compiler)
        // 设置runtime chunk
        setRuntimeChunk(compiler, this.options.outputDir, this.pluginDir)

        compiler.hooks.emit.tap(WxMiniProgramOriginalPlugin.PLUGIN_NAME, () => {
            console.log('enter')
        })
    }

    /**
     * 获取webpack所需的入口
     */
    public getEntry() {
        return getEntry(this.options.outputDir, this.pluginDir)
    }

    /**
     * 获取webpack所需的output信息
     */
    public getOutput() {
        return getOutput(this.options.outputDir)
    }
}