import { Injectable, OnModuleInit } from '@nestjs/common';
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../../../resources/icon.png?asset'

@Injectable()
export class WindowService {
    newWindow(view: string): void {
        const newWindow = new BrowserWindow({
            width: 1024,
            height: 670,
            show: false,
            autoHideMenuBar: true,
            ...(process.platform === 'linux' ? { icon } : {}),
            webPreferences: {
                preload: join(__dirname, '../preload/index.js'),
                sandbox: false
            }
        })

        newWindow.on('ready-to-show', () => {
            newWindow.show()
        })
        newWindow.webContents.once('dom-ready', () => {
            newWindow.webContents.send('init', { view })
        })

        newWindow.on('show', () => {
            newWindow.webContents.openDevTools()
        });

        // TODO Whats this
        newWindow.webContents.setWindowOpenHandler((details) => {
            shell.openExternal(details.url)
            return { action: 'deny' }
        })

        // HMR for renderer base on electron-vite cli.
        // Load the remote URL for development or the local html file for production.
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            newWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
        } else {
            newWindow.loadFile(join(__dirname, '../../renderer/index.html'))
        }
    }

    addSettingsItem(view: string) {
        // TODO tell renderer to add a new item to the settings menu
    }

    addHeaderItem(view: string) {
        // TODO tell renderer to add a new item to the header menu
    }

    addFooterItem(view: string) {
        // TODO tell renderer to add a new item to the footer menu
    }

    addContextItem(view: string) {
        // TODO tell renderer to add a new item to the main context
    }
}
