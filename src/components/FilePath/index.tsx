import React from 'react';
import { FC, useEffect, useState } from 'react';
import clsx from 'clsx';
import { shell } from 'electron';
import { join } from 'path';

import { chatRoot } from '../../utils';

interface FilePathProps {
    paths?: string;
    label?: string;
    className?: string;
    content?: string;
    url?: string;
}

const FilePath: FC<FilePathProps> = ({ className, label = 'PATH', paths = '', url, content }) => {
    const [filePath, setPath] = useState('');

    useEffect(() => {
        if (!paths && !url) return;
        (async () => {
            if (url) {
                setPath(url);
                return;
            }
            setPath(await join(await chatRoot(), ...paths.split('/').filter((i) => !!i)));
        })();
    }, [url, paths]);

    return (
        <div className={clsx(className, 'chat-file-path')}>
            <div>
                {label}:{' '}
                <a onClick={() => shell.openPath(filePath)} title={filePath}>
                    {content ? content : filePath}
                </a>
            </div>
        </div>
    );
};

export default FilePath;
