import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dialog, app, shell } from 'electron';
import { Form, Tabs, Space, Button, Popconfirm, message } from 'antd';
import { join } from 'path';
import { ipcRenderer } from 'electron';
import { clone, omit, isEqual } from 'lodash';

import useInit from '../../hooks/useInit';
import FilePath from '../../components/FilePath';
import { chatRoot, APP_CONF_JSON } from '../../utils';
import General from './General';
import MainWindow from './MainWindow';
import TrayWindow from './TrayWindow';

export default function Settings() {
    const [params] = useSearchParams();
    const [activeKey, setActiveKey] = useState('general');
    const [form] = Form.useForm();
    const [chatConf, setChatConf] = useState<any>(null);
    const [filePath, setPath] = useState('');
    const key = params.get('type');

    useEffect(() => {
        setActiveKey(key ? key : 'general');
    }, [key]);

    useInit(async () => {
        setChatConf(await ipcRenderer.invoke('get_app_conf'));
        setPath(join(await chatRoot(), APP_CONF_JSON));
    });

    useEffect(() => {
        form.setFieldsValue(clone(chatConf));
    }, [chatConf]);

    const onCancel = () => {
        form.setFieldsValue(chatConf);
    };

    const onReset = async () => {
        const chatData = await ipcRenderer.invoke('reset_app_conf');
        setChatConf(chatData);
        const options = {
            type: 'question',
            buttons: ['Yes', 'No'],
            message: 'Configuration reset successfully, whether to restart?',
            title: 'ChatGPT Preferences',
        };
        const { response } = await dialog.showMessageBox(options);
        if (response === 0) {
            app.relaunch();
            app.quit();
            return;
        }
        message.success('Configuration reset successfully');
    };

    const onFinish = async (values: any) => {
        if (!isEqual(omit(chatConf, ['default_origin']), values)) {
            await ipcRenderer.invoke('form_confirm', { data: values, label: 'main' });
            const options = {
                type: 'question',
                buttons: ['Yes', 'No'],
                message: 'Configuration reset successfully, do you want to restart?',
                title: 'ChatGPT Preferences',
            };
            const { response } = await dialog.showMessageBox(options);
            if (response === 0) {
                app.relaunch();
                app.quit();
                return;
            }
            message.success('Configuration saved successfully');
        }
    };

    const handleTab = (v: string) => {
        setActiveKey(v);
    };

    return (
        <div>
            <FilePath paths={APP_CONF_JSON} />
            <Form
                form={form}
                style={{ maxWidth: 500 }}
                onFinish={onFinish}
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 13, offset: 1 }}
            >
                <Tabs
                    activeKey={activeKey}
                    onChange={handleTab}
                    items={[
                        { label: 'General', key: 'general', children: <General /> },
                        { label: 'Main Window', key: 'main_window', children: <MainWindow /> },
                        { label: 'SystemTray Window', key: 'tray_window', children: <TrayWindow /> },
                    ]}
                />

                <Form.Item>
                    <Space size={20}>
                        <Button onClick={onCancel}>Cancel</Button>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Popconfirm
                            title={
                                <div style={{ width: 360 }}>
                                    Are you sure you want to reset the configuration file
                                    <a onClick={() => shell.openPath(filePath)} style={{ margin: '0 5px' }}>
                                        {filePath}
                                    </a>
                                    to the default?
                                </div>
                            }
                            onConfirm={onReset}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="dashed">Reset to defaults</Button>
                        </Popconfirm>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
}