// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {id as pluginId} from 'manifest';
import {closeCloseOrReOpenIssueModal, closeOrReopenIssue} from 'actions';

import CloseOrReopenIssueModal from './close_reopen_issue';

const mapStateToProps = (state) => {
    const {channelId,owner,repo,number,status,postId} = state[`plugins-${pluginId}`].closeOrReopenIssueModal;
    return {
        visible: state[`plugins-${pluginId}`].isCloseOrReopenIssueModalVisible,
        channelId,
        postId,
        owner,
        repo,
        number,
        status,
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    closeCloseOrReOpenIssueModal,
    closeOrReopenIssue,
}, dispatch);

export default connect(mapStateToProps,mapDispatchToProps)(CloseOrReopenIssueModal);
