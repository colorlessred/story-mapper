# Data Model

- horizontal dimension is made of `Step`s. 
- the vertical dimension is organised in `Version`s
- The hierarchy to the `Note` is: `AllJourneys` -> `Journey` -> `Step` -> `Note`
- the `Note` also links to the `Version` for which there is smaller hierarchy: `AllVersions` -> `Version` -> `Note`
- for all the `Step`s each `Version` computes the `Notes` it contains, grouped by `Step`s. 
    - this gives us a different ranking position, which is of the `Note` in the `Step` in the `Version`.
- the `Note` id comes from the position of `Journey`.`Step`.`Version`."raking the the step version"


