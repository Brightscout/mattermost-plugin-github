// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {attachCommentIssueModal, editIssueModal, closeOrReopenIssueModal} from '../../actions';

import GithubIssue from './github_issue';

function mapStateToProps(ownProps) {
    return {
        ...ownProps,
    };
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({attachCommentIssueModal, editIssueModal, closeOrReopenIssueModal}, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(GithubIssue);
