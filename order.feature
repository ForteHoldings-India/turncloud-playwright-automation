
@tag
Feature: Title of your feature
  I want to use this template for my feature file
  
Background:
Given: I Landed to Ecommerce site


  @tag2
  Scenario Outline: Positive testCase on SubmitOrder
    Given Login with the usename<name> and password <password>
    When I Add the <productname> to Cart
    And Checkout <productname> and submit the order
    Then Thankyou for the order. message displayed on ConfirmationMessage

    Examples: 
      | name                    | password  | productname  |
      | anaghagangane@gmail.com | Abcd@1234 | ZARA COAT 3  |
     
