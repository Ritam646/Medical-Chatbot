$(document).ready(function() {
    // Initial greeting
    appendMessage("Hi! I'm your medical assistant. How can I help you today?", "bot");

    $("#chatForm").on("submit", function(e) {
        e.preventDefault();
        
        // Get user input
        const userInput = $("#userInput").val().trim();
        
        if (userInput !== "") {
            // Clear input field
            $("#userInput").val("");
            
            // Add user message to chat
            appendMessage(userInput, "user");
            
            // Show loading animation
            showLoading();
            
            // Send request to server
            $.ajax({
                url: "/get",
                type: "POST",
                data: {msg: userInput},
                success: function(response) {
                    // Hide loading animation
                    hideLoading();
                    // Add bot response to chat
                    appendMessage(response, "bot");
                },
                error: function() {
                    // Hide loading animation
                    hideLoading();
                    // Show error message
                    appendMessage("Sorry, there was an error processing your request.", "bot");
                }
            });
        }
    });

    function appendMessage(content, sender) {
        const messageDiv = $("<div>").addClass("message").addClass(sender + "-message");
        const messageContent = $("<div>").addClass("message-content").text(content);
        messageDiv.append(messageContent);
        $("#chatBox").append(messageDiv);
        
        // Scroll to bottom
        $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
    }

    function showLoading() {
        const loading = $("<div>").addClass("loading message bot-message");
        loading.append($("<span>"));
        loading.append($("<span>"));
        loading.append($("<span>"));
        $("#chatBox").append(loading);
        $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
    }

    function hideLoading() {
        $(".loading").remove();
    }
});
