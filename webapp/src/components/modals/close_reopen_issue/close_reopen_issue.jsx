// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'react-bootstrap';

import FormButton from 'components/form_button';
import Input from 'components/input';

import {getErrorMessage} from 'utils/user_utils';

const CloseOrReopenIssueModal = (props) => {
    if (!props.visible) {
        return null;
    }

    const handleCloseOrReopenIssue = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        const issue = {
            channel_id: props.channelId,
            comment: comment,
            status_reason: statusReason,
            repo: props.repo,
            number: props.number,
            owner: props.owner,
            status: props.status,
            postId: props.postId,
        };
        setSubmitting(true);
        const changedState = await props.closeOrReopenIssue(issue);
        if (changedState.error) {
            const errMessage = getErrorMessage(changedState.error.message);
            setError(errMessage)
            setSubmitting(false)
            return;
        }
        handleClose(e);
    };

    const handleClose = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        props.closeCloseOrReOpenIssueModal()
    };

    const handleStatusChange = (e) => {
        setStatusReason(e.target.value)
    }

    const handleIssueCommentChange = (comment) => setComment(comment);
    const [comment, setComment] = useState('');
    const [statusReason, setStatusReason] = useState(props.status != "Close" ? "reopened" : "completed");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const {theme} = props;
    const style = getStyle(theme);
    const modalTitle = props.status +" Issue";
    const savingMessage = props.status != "Close" ? 'Reopening' : 'Closing';
    const status = props.status + " Issue"

    let submitError = null;
    if (error) {
        submitError = (
            <p className='help-text error-text'>
                <span>{error}</span>
            </p>
        );
    }
    let component = (
        <div>
            <Input
                label='Leave a comment (optional)'
                type='textarea'
                onChange={handleIssueCommentChange}
                value = {comment}
            />
            <div>
                <input type="radio" id="completed" name="close_issue" value="completed" defaultChecked onChange={handleStatusChange}/>
                <label style={style.radioButtons} for="completed">Mark issue as completed</label><br/>
                <input type="radio" id="not_planned" name="close_issue" value="not_planned" onChange={handleStatusChange}/>
                <label style={style.radioButtons} for="not_planned">Mark issue as not planned</label>
            </div>
        </div>
    );
    if (props.status != "Close") {
        component = (
            <div>
                <Input
                    label='Leave a comment (optional)'
                    type='textarea'
                    onChange={handleIssueCommentChange}
                    value = {comment}
                />
            </div>
        );
    }

    return (
        <Modal
            dialogClassName='modal--scroll'
            show={true}
            onHide={handleClose}
            onExited={handleClose}
            bsSize='large'
            backdrop='static'
        >
            <Modal.Header closeButton={true}>
                <Modal.Title>
                    {modalTitle}
                </Modal.Title>
            </Modal.Header>
            <form
                role='form'
                onSubmit={handleCloseOrReopenIssue}
            >
                <Modal.Body
                    style={style.modal}
                >
                    {component}
                </Modal.Body>
                <Modal.Footer>
                        {submitError}
                    <FormButton
                        type='button'
                        btnClass='btn-link'
                        defaultMessage='Cancel'
                        onClick={handleClose}
                    />
                    <FormButton
                        type='submit'
                        btnClass='btn btn-primary'
                        saving={submitting}
                        defaultMessage={modalTitle}
                        savingMessage={savingMessage}
                    >
                        {status}
                    </FormButton>
                </Modal.Footer>
            </form>
        </Modal>
    );
}

const getStyle = (theme) => ({
    modal: {
        padding: '2em 2em 3em',
        color: theme.centerChannelColor,
        backgroundColor: theme.centerChannelBg,
    },
    descriptionArea: {
        height: 'auto',
        width: '100%',
        color: '#000',
    },
    radioButtons: {
        margin: '7px 10px',
    },
});

export default CloseOrReopenIssueModal;
