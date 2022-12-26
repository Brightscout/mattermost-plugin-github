// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {id as pluginId} from 'manifest';
import {closeCreateOrUpdateIssueModal, createIssue, updateIssue} from 'actions';

import CreateOrUpdateIssueModal from './create_update_issue';

const mapStateToProps = (state) => {
    const {postId, title, milestoneTitle, milestoneNumber, issueNumber, labels, assignees, description, repoName, channelId} = state[`plugins-${pluginId}`].createOrUpdateIssueModal;
    const post = (postId) ? getPost(state, postId) : null;

    return {
        visible: state[`plugins-${pluginId}`].isCreateOrUpdateIssueModalVisible,
        post,
        title,
        milestoneTitle,
        milestoneNumber,
        issueNumber,
        labels,
        assignees,
        description,
        repoName,
        channelId,
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    close: closeCreateOrUpdateIssueModal,
    create: createIssue,
    update: updateIssue,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CreateOrUpdateIssueModal);
