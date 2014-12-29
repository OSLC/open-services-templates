$(document).ready(function()
{ 
    $("#vid-gallery").yoxview({ skin: "top_menu" });

    /* Dialog Config */
    $("#supportDialog" ).dialog({ autoOpen: false, width: 520 });
    $("#supportButton").click(function () 
    {
        $("#supportDialog").dialog('open');
    }); 
    
    /* Button config */
    $("input:submit, input:reset").button(); 
    
    // Handle highlighting of related input fields
    $(".wrapper input, .wrapper select, .wrapper textarea").focus(function()
    {
        $(this).parents(".wrapper-parent").addClass("highlight");
    }).blur(function()
    {
        $(this).parents(".wrapper-parent").removeClass("highlight");
    });
    
    $("#supportForm").validationEngine({
        isOverflown: true,
        overflownDIV: "#support-oslc"
    });
    $("#supportForm").validationEngine('attach');
    
    /* Handle submission of the support form */
    $("#supportSubmit").click(function() 
    {
        var valid = $("#supportForm").validationEngine('validate');
    
        if(valid)
        {
            $.ajax(
            {
                url: "/support.php", 
                type: "post",
                data: 
                {
                    fname: $("#fname").val(), 
                    mi: $("#mi").val(), 
                    lname: $("#lname").val(), 
                    company: $("#company").val(), 
                    email: $("#email").val(), 
                    role: $("#role").val() 
                }, 
                complete: function(data) 
                {
                   $('#supportDialog').html('<p>Thank you for your interest. Care to share with others?<\/p><div><a href="http://twitter.com/oslcNews" class="twitter-follow-button">Follow @oslcNews<\/a><script src="http://platform.twitter.com/widgets.js" type="text/javascript"><\/script><\/div><div><iframe src="http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fopen-services.net&amp;send=true&amp;layout=standard&amp;width=300&amp;show_faces=true&amp;action=like&amp;colorscheme=light&amp;font&amp;height=80" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:300px; height:80px;" allowTransparency="true"><\/iframe><\/div>');
                }, 
            });
        }
    });
});