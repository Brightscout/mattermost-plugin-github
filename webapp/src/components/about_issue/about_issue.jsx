import {makeStyleFromTheme} from 'mattermost-redux/utils/theme_utils';
const AboutIssue = (props) => {
    const style = getStyle(props.theme);
    const post = props.post;
    const postProps = post.props || {};
    let content;
    let assignees;
    let labels;
    let buttonClassName='btn btn-danger';

    if (postProps.status != 'Close') {
        buttonClassName='btn btn-primary';
    }
    content = (
        <div>
            <div>
                <button style={style.button} className='btn btn-primary' onClick={()=>{props.actions.attachCommentIssueModal(postProps.repo_owner,postProps.repo_name,postProps.issue_number,post.id)}}>Comment</button>
                <button style={style.button} className='btn btn-primary' onClick={()=>{props.actions.editIssueModal(postProps.repo_owner,postProps.repo_name,postProps.issue_number,post.id)}}>Edit</button>
                <button style={style.button} className={buttonClassName} onClick={()=>{props.actions.closeOrReopenIssueModal(postProps.repo_owner,postProps.repo_name,postProps.issue_number,postProps.status,post.id)}}>{postProps.status}</button>
            </div>
        </div>
    );
    if (postProps.assignees && postProps.assignees?.length != 0) {
        assignees=(
            <div style={style.assignees_and_labels}>
                <b>Assignees</b>
                <div>
                    {postProps.assignees?.map((assignee,index)=>(
                        <span key={assignee}>{(index ? ', ' : '')+assignee} </span>
                    ))}
                </div>
            </div>
        )
    }
    if (postProps.labels && postProps.labels?.length != 0) {
        labels=(
            <div style={style.assignees_and_labels}>
                <b>Labels</b>
                <div>
                    {postProps.labels?.map((label,index)=>(
                        <span key={label}>{(index ? ', ' : '')+label} </span>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            <h5>
                <a href={postProps.issue_url}>#{postProps.issue_number} {postProps.title}</a>
            </h5>
            <p>{postProps.description}</p>
            {assignees}
            {labels}
            {content}
        </div>
    );
}

const getStyle = makeStyleFromTheme((theme) => {
    return {
        button: {
            fontFamily: 'Open Sans',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            lineHeight: '19px',
            marginTop: '12px',
            marginRight: '12px',
            borderRadius: '4px',
            color: theme.buttonColor,
        },
        assignees_and_labels: {
            display: "inline-block",
            verticalAlign: "top",
            width: "30%",
        }
    };
});

export default AboutIssue;
