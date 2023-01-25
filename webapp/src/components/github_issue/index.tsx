import * as React from 'react';
import {makeStyleFromTheme} from 'mattermost-redux/utils/theme_utils';
import {Theme} from 'mattermost-redux/types/preferences';
import {Post} from 'mattermost-redux/types/posts';
import {useDispatch} from 'react-redux';

import {attachCommentIssueModal, editIssueModal, closeOrReopenIssueModal} from '../../actions';

type GithubIssueProps = {
    theme: Theme,
    post: Post,
}

const GithubIssue = ({theme, post}: GithubIssueProps) => {
    const style = getStyle(theme);
    const postProps = post.props || {};
    let assignees;
    let labels;
    const buttonClassName = 'btn btn-primary';
    const dispatch = useDispatch();

    const issue = {
        repo_owner: postProps.repo_owner,
        repo_name: postProps.repo_name,
        issue_number: postProps.issue_number,
        postId: post.id,
        status: postProps.status,
    };

    const content = (
        <div>
            <button
                style={{...style.button, ...style.other_buttons}}
                className='btn btn-primary'
                onClick={() => dispatch(attachCommentIssueModal(issue))}
            >{'Comment'}</button>
            <button
                style={{...style.button, ...style.other_buttons}}
                className='btn btn-primary'
                onClick={() => dispatch(editIssueModal(issue))}
            >{'Edit'}</button>
            <button
                style={{...style.button, ...{...postProps.status === 'Close' ? style.close_or_reopen_button : style.other_buttons}}}
                className={buttonClassName}
                onClick={() => dispatch(closeOrReopenIssueModal(issue))}
            >{postProps.status}</button>
        </div>
    );

    if (postProps.assignees?.length) {
        assignees = (
            <div style={style.assignees_and_labels}>
                <b>{'Assignees'}</b>
                <div>
                    {postProps.assignees.map((assignee: string, index: number) => (
                        <span key={assignee}>{(index ? ', ' : '') + assignee} </span>
                    ))}
                </div>
            </div>
        );
    }

    if (postProps.labels?.length) {
        labels = (
            <div style={style.assignees_and_labels}>
                <b>{'Labels'}</b>
                <div>
                    {postProps.labels.map((label: string, index: number) => (
                        <span key={label}>{(index ? ', ' : '') + label} </span>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h5>
                <a
                    href={postProps.issue_url}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {'#' + postProps.issue_number + ' ' + postProps.title}
                </a>
            </h5>
            <p>{postProps.description}</p>
            {assignees}
            {labels}
            {content}
        </div>
    );
};

const getStyle = makeStyleFromTheme((theme) => ({
    button: {
        fontFamily: 'Open Sans',
        fontSize: '12px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        lineHeight: '19px',
        margin: '12px 12px 8px 0px',
        borderRadius: '4px',
        color: theme.buttonColor,
    },
    close_or_reopen_button: {
        backgroundColor: '#dc3545',
    },
    other_buttons: {
        backgroundColor: theme.buttonBg,
    },
    assignees_and_labels: {
        display: 'inline-block',
        verticalAlign: 'top',
        width: '30%',
    },
}));

export default GithubIssue;
