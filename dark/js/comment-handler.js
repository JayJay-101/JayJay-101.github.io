// comment-handler.js
document.addEventListener('DOMContentLoaded', function() {
    const commentForm = document.querySelector('.comment-form-container form');
    const commentsList = document.querySelector('.comments-list');

    // Handle showing reply forms
    document.querySelectorAll('.reply-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const commentId = this.getAttribute('data-comment-id');
            const existingForm = document.querySelector('.reply-form-' + commentId);
            
            if (existingForm) {
                existingForm.remove();
                return;
            }

            const replyForm = createReplyForm(commentId);
            const parentComment = this.closest('.comment');
            parentComment.appendChild(replyForm);
        });
    });

    function createReplyForm(parentId) {
        const formDiv = document.createElement('div');
        formDiv.className = 'reply-form-' + parentId + ' mt-3';
        
        formDiv.innerHTML = `
            <form method="POST" action="https://api.staticman.net/v3/entry/github/JayJay-101/JayJay-101.github.io/main/comments">
                <input type="hidden" name="options[slug]" value="${window.location.pathname}">
                <input type="hidden" name="fields[parent]" value="${parentId}">
                <input type="hidden" name="options[reCaptcha][siteKey]" value="${document.querySelector('[name="options[reCaptcha][siteKey]"]').value}">
                
                <div class="form-group">
                    <textarea 
                        name="fields[message]" 
                        class="form-control" 
                        placeholder="Type your reply..."
                        rows="3" 
                        required
                    ></textarea>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <input 
                                type="text" 
                                name="fields[name]" 
                                class="form-control" 
                                placeholder="Your Name" 
                                required
                            >
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group">
                            <input 
                                type="email" 
                                name="fields[email]" 
                                class="form-control" 
                                placeholder="Your Email" 
                                required
                            >
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <button type="submit" class="btn btn-primary btn-sm">
                        Submit Reply
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm ml-2" onclick="this.closest('.reply-form-${parentId}').remove()">
                        Cancel
                    </button>
                </div>
            </form>
        `;
        
        return formDiv;
    }

    // Handle form submissions
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            // Create form data
            const formData = new FormData(this);
            
            // Submit to Staticman
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    showAlert('success', 'Comment submitted successfully! It will appear after moderation.');
                    this.reset();
                } else {
                    throw new Error('Comment submission failed');
                }
            })
            .catch(error => {
                showAlert('danger', 'Error submitting comment. Please try again.');
                console.error('Error:', error);
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Comment';
            });
        });
    }

    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        
        const formContainer = document.querySelector('.comment-form-container');
        formContainer.insertBefore(alertDiv, formContainer.firstChild);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
});