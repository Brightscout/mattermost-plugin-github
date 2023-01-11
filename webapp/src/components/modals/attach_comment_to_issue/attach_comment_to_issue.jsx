// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'react-bootstrap';

import FormButton from 'components/form_button';
import Input from 'components/input';

import GithubIssueSelector from 'components/github_issue_selector';
import {getErrorMessage} from 'utils/user_utils';

const initialState = {
    comment: '',
    submitting: false,
    issueValue: null,
    textSearchTerms: '',
    error: null,
};

export default class AttachIssueModal extends PureComponent {
    static propTypes = {
        close: PropTypes.func.isRequired,
        create: PropTypes.func.isRequired,
        post: PropTypes.object,
        theme: PropTypes.object.isRequired,
        visible: PropTypes.bool.isRequired,
        messageData: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = initialState;
    }

    handleCreate = (e) => {
        const data = this.props.messageData;
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        if (!this.state.issueValue) {
            const issue = {
                owner: data.owner,
                repo: data.repo,
                number: data.number,
                comment: this.state.comment,
                post_id: this.props.post.id,
                show_attached_message: false,
            };
            this.setState({submitting: true});

            this.props.create(issue).then((created) => {
                if (created.error) {
                    const errMessage = getErrorMessage(created.error.message);
                    this.setState({error: errMessage, submitting: false});
                    return;
                }
                this.handleClose(e);
            });
            return;
        }

        const number = this.state.issueValue.number;
        const repoUrl = this.state.issueValue.repository_url;
        const repoUrlParts = repoUrl.split('/');
        const repo = repoUrlParts.pop();
        const owner = repoUrlParts.pop();

        const issue = {
            owner,
            repo,
            number,
            comment: this.props.post.message,
            post_id: this.props.post.id,
            show_attached_message: true,
        };

        this.setState({submitting: true});

        this.props.create(issue).then((created) => {
            if (created.error) {
                const errMessage = getErrorMessage(created.error.message);
                this.setState({error: errMessage, submitting: false});
                return;
            }

            this.handleClose(e);
        });
    };

    handleIssueCommentChange = (comment) => this.setState({comment});

    handleClose = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        const {close} = this.props;
        this.setState(initialState, close);
    };

    handleIssueValueChange = (newValue) => {
        this.setState({
            issueValue: newValue,
        });
    };

    render() {
        const data = this.props.messageData;
        const {visible, theme} = this.props;
        const {error, submitting} = this.state;
        const style = getStyle(theme);
        const modalTitle = data?.number ? 'Create a comment to GitHub Issue' : 'Attach Message to GitHub Issue';

        if (!visible) {
            return null;
        }

        let component = (
            <div>
                <GithubIssueSelector
                    id={'issue'}
                    onChange={this.handleIssueValueChange}
                    required={true}
                    theme={theme}
                    error={error}
                    value={this.state.issueValue}
                />
                <Input
                    label='Message Attached to GitHub Issue'
                    type='textarea'
                    isDisabled={true}
                    value={this.props.post.message}
                    disabled={false}
                    readOnly={true}
                />
            </div>
        );
        if (data?.number) {
            component = (
                <div>
                    <Input
                        label='Create a comment'
                        type='textarea'
                        onChange={this.handleIssueCommentChange}
                        value={this.state.comment}
                    />

                </div>
            );
        }

        return (
            <Modal
                dialogClassName='modal--scroll'
                show={true}
                onHide={this.handleClose}
                onExited={this.handleClose}
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
                    onSubmit={this.handleCreate}
                >
                    <Modal.Body
                        style={style.modal}
                        ref='modalBody'
                    >
                        {component}
                    </Modal.Body>
                    <Modal.Footer>
                        <FormButton
                            type='button'
                            btnClass='btn-link'
                            defaultMessage='Cancel'
                            onClick={this.handleClose}
                        />
                        <FormButton
                            type='submit'
                            btnClass='btn btn-primary'
                            saving={submitting}
                            defaultMessage='Attach'
                            savingMessage='Attaching'
                        >
                            {'Attach'}
                        </FormButton>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
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
});
