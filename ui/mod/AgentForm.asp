<form id="agent-form">
  <div class="form-group">
    <label for="id">ID:</label>
    <input type="text" id="id" name="id" maxlength="16">
    <div class="error-message" id="id-error"></div>
  </div>
  <div class="form-group">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" maxlength="32">
    <div class="error-message" id="name-error"></div>
  </div>
  <div class="form-group">
    <label for="summary">Summary:</label>
    <textarea id="summary" name="summary"></textarea>
    <div class="error-message" id="summary-error"></div>
  </div>
  <div class="form-group">
    <label for="params">Params (JSON):</label>
    <textarea id="params" name="params"></textarea>
    <div class="error-message" id="params-error"></div>
  </div>
  <div class="form-group">
    <label for="persona">Persona:</label>
    <textarea id="persona" name="persona"></textarea>
    <div class="error-message" id="persona-error"></div>
  </div>
</form>