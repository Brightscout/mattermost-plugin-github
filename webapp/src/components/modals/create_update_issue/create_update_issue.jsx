// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'react-bootstrap';

import GithubLabelSelector from 'components/github_label_selector';
import GithubAssigneeSelector from 'components/github_assignee_selector';
import GithubMilestoneSelector from 'components/github_milestone_selector';
import GithubRepoSelector from 'components/github_repo_selector';
import Validator from 'components/validator';
import FormButton from 'components/form_button';
import Input from 'components/input';
import {getErrorMessage} from 'utils/user_utils';

const MAX_TITLE_LENGTH = 256;

const initialState = {
    submitting: false,
    error: null,
    repo: null,
    issueTitle: '',
    issueDescription: '',
    labels: [],
    assignees: [],
    milestone: null,
    showErrors: false,
    issueTitleValid: true,
};

export default class CreateOrUpdateIssueModal extends PureComponent {
    static propTypes = {
        update: PropTypes.func.isRequired,
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
        this.validator = new Validator();
    }

    /* eslint-disable react/no-did-update-set-state*/
    componentDidUpdate(prevProps) {
        if (!this.props.messageData) {
            return;
        }
        const {channel_id, title, description, assignees, labels, milestone_title, milestone_number, repo_full_name} = this.props.messageData;
        if (this.props.post && !prevProps.post && !title) {
            this.setState({issueDescription: this.props.post.message});
        } else if (channel_id && (channel_id !== prevProps.messageData?.channel_id || title !== prevProps.messageData?.title || description !== prevProps.messageData?.description || assignees !== prevProps.messageData?.assignees || labels !== prevProps.messageData?.labels || milestone_title !== prevProps.messageData?.milestone_title || milestone_number !== prevProps.messageData?.milestone_number)) {
            if (assignees) {
                this.setState({assignees});
            }
            if (labels) {
                this.setState({labels});
            }
            this.setState({milestone: {
                value: milestone_number,
                label: milestone_title,
            }});
            this.setState({issueDescription: description});
            this.setState({repo: repo_full_name});
            this.setState({issueTitle: title.substring(0, MAX_TITLE_LENGTH)});
        }
    }
    /* eslint-enable */

    // handle issue creation after form is populated
    handleCreate = async (e) => {
        const {channel_id, issue_number, repo_full_name} = this.props.messageData;
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        if (!this.validator.validate() || !this.state.issueTitle) {
            this.setState({
                issueTitleValid: Boolean(this.state.issueTitle),
                showErrors: true,
            });
            return;
        }

        const {post} = this.props;
        const postId = (post) ? post.id : '';

        const issue = {
            title: this.state.issueTitle,
            body: this.state.issueDescription,
            repo: this.state.repo && this.state.repo.name,
            labels: this.state.labels,
            assignees: this.state.assignees,
            milestone: this.state.milestone && this.state.milestone.value,
            post_id: postId,
            channel_id,
            issue_number,
        };

        if (!issue.repo) {
            issue.repo = this.state.repo;
        }
        this.setState({submitting: true});
        if (repo_full_name) {
            const updated = await this.props.update(issue);
            if (updated.error) {
                const errMessage = getErrorMessage(updated.error.message);
                this.setState({
                    error: errMessage,
                    showErrors: true,
                    submitting: false,
                });
                return;
            }
        } else {
            const created = await this.props.create(issue);
            if (created.error) {
                const errMessage = getErrorMessage(created.error.message);
                this.setState({
                    error: errMessage,
                    showErrors: true,
                    submitting: false,
                });
                return;
            }
        }
        this.handleClose(e);
    };

    handleClose = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        this.setState(initialState, this.props.close);
    };

    handleRepoChange = (repo) => this.setState({repo});

    handleLabelsChange = (labels) => this.setState({labels});

    handleAssigneesChange = (assignees) => this.setState({assignees});

    handleMilestoneChange = (milestone) => this.setState({milestone});

    handleIssueTitleChange = (issueTitle) => this.setState({issueTitle});

    handleIssueDescriptionChange = (issueDescription) => this.setState({issueDescription});

    renderIssueAttributeSelectors = () => {
        if (!this.state.repo || (this.state.repo.permissions && !this.state.repo.permissions.push)) {
            return null;
        }

        let repoName = this.state.repo.name;
        if (!repoName) {
            repoName = this.state.repo;
        }
        return (
            <>
                <GithubLabelSelector
                    repoName={repoName}
                    theme={this.props.theme}
                    selectedLabels={this.state.labels}
                    onChange={this.handleLabelsChange}
                />

                <GithubAssigneeSelector
                    repoName={repoName}
                    theme={this.props.theme}
                    selectedAssignees={this.state.assignees}
                    onChange={this.handleAssigneesChange}
                />

                <GithubMilestoneSelector
                    repoName={repoName}
                    theme={this.props.theme}
                    selectedMilestone={this.state.milestone}
                    onChange={this.handleMilestoneChange}
                />
            </>
        );
    }

    render() {
        if (!this.props.visible) {
            return null;
        }

        const theme = this.props.theme;
        const {error, submitting} = this.state;
        const style = getStyle(theme);
        const {repo_full_name} = this.props.messageData;
        const modalTitle = repo_full_name ? 'Update GitHub Issue' : 'Create GitHub Issue';

        const requiredMsg = 'This field is required.';
        let issueTitleValidationError = null;
        if (this.state.showErrors && !this.state.issueTitleValid) {
            issueTitleValidationError = (
                <p className='help-text error-text'>
                    <span>{requiredMsg}</span>
                </p>
            );
        }

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
                <GithubRepoSelector
                    onChange={this.handleRepoChange}
                    value={this.state.repo && this.state.repo.name}
                    required={true}
                    theme={theme}
                    addValidate={this.validator.addComponent}
                    removeValidate={this.validator.removeComponent}
                />

                <Input
                    id={'title'}
                    label='Title for the GitHub Issue'
                    type='input'
                    required={true}
                    disabled={false}
                    maxLength={MAX_TITLE_LENGTH}
                    value={this.state.issueTitle}
                    onChange={this.handleIssueTitleChange}
                />
                {issueTitleValidationError}

                {this.renderIssueAttributeSelectors()}

                <Input
                    label='Description for the GitHub Issue'
                    type='textarea'
                    value={this.state.issueDescription}
                    onChange={this.handleIssueDescriptionChange}
                />
            </div>
        );
        if (repo_full_name) {
            component = (
                <div>
                    <Input
                        label='Repository'
                        type='input'
                        required={true}
                        disabled={true}
                        value={repo_full_name}
                    />

                    <Input
                        id={'title'}
                        label='Title for the GitHub Issue'
                        type='input'
                        required={true}
                        maxLength={MAX_TITLE_LENGTH}
                        value={this.state.issueTitle}
                        onChange={this.handleIssueTitleChange}
                    />
                    {issueTitleValidationError}
                    {this.renderIssueAttributeSelectors()}

                    <Input
                        label='Description for the GitHub Issue'
                        type='textarea'
                        value={this.state.issueDescription}
                        onChange={this.handleIssueDescriptionChange}
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
                        {submitError}
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
                            defaultMessage='Submit'
                            savingMessage='Submitting'
                        >
                            {'Submit'}
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
