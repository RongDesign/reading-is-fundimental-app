/*[
   {
       "Profile ID": "44",
       "field_user_type": [
           "Parent",
           "Teacher",
           "Volunteer"
       ],
       "field_areas_of_interest": [
           "Activity/Lesson Plans",
           "Arts",
           "Assessment To",
           "Bilingual",
           "eBooks",
           "Games",
           "Picture Books",
           "Poetry",
           "Professional Development",
           "Special Needs",
           "STEM",
           "Videos",
           "Other (Under Development)"
       ],
       "field_community_user_type": "",
       "field_phone_number": "",
       "field_volunteer_interest": [

       ],
       "user": "279"
   }
]*/

app.controller('registerCtrl', [
  '$state', 'UserService',
  function ($state, UserService) {
    var t = this;
    t.submit = function(data) {
      UserService.register(data).then(function(reg_data) {
        UserService.signIn({username:data.username, password:data.password}).then(function() {
          $state.go('home');
        });
      });
    }
  }
]);