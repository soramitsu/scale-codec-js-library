it('click and all is ok', () => {
    cy.visit('/')
    cy.get('#act').click()
    cy.contains('#result', 'ok')
})
