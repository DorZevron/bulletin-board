using BulletinBoard.Application.DTOs;
using BulletinBoard.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace BulletinBoard.Api.Controllers;

[ApiController]
[Route("api/advertisements")]
public class AdvertisementsController : ControllerBase
{
    private readonly AdvertisementService _service;

    public AdvertisementsController(AdvertisementService service)
    {
        _service = service;
    }


    // -- GET /api/advertisements -- //
    [HttpGet]
    public async Task<ActionResult<PagedResult<AdvertisementResponse>>> GetAll(
    [FromQuery] AdvertisementQuery query,
    CancellationToken cancellationToken)
    {
        var result = await _service.GetAsync(query, cancellationToken);
        return Ok(result);
    }


    //-- GET /api/advertisements/{id} -- // 
    [HttpGet("{id}")]
    public async Task<ActionResult<AdvertisementResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);

        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }


    // -- POST /api/advertisements -- //
    [HttpPost]
    public async Task<ActionResult<AdvertisementResponse>> Create(
    [FromBody] CreateAdvertisementRequest request,
    CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }


    // -- PUT /api/advertisements/{id} -- // 
    [HttpPut("{id}")]
    public async Task<ActionResult<AdvertisementResponse>> Update(
        Guid id,
        [FromBody] UpdateAdvertisementRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, request, cancellationToken);
        return Ok(result);
    }


    // -- DELETE /api/advertisements/{id} -- // 
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}


