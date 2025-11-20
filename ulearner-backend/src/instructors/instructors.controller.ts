import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { InstructorsService } from './instructors.service';

@Controller({
  path: 'instructors',
  version: '1',
})
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Get()
  findAll() {
    return this.instructorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.instructorsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInstructorDto) {
    return this.instructorsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInstructorDto,
  ) {
    return this.instructorsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.instructorsService.remove(id);
  }
}
